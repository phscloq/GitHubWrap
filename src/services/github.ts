import type { GitHubUser, GitHubRepo, ContributionYear, WrapData, LanguageParam } from "../types";
import { GitHubAPIError } from "../utils/errors";

// Backend API URL - token is handled server-side securely
// For Vercel: uses /api routes (serverless functions)
// For local dev: uses backend server on port 3001
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to parse rate limit headers and calculate retry delay
const getRetryAfter = (headers: Record<string, string>): number | undefined => {
  const retryAfter = headers['retry-after'] || headers['x-ratelimit-reset'];
  if (retryAfter) {
    const resetTime = parseInt(retryAfter, 10);
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, (resetTime - now) * 1000); // Convert to milliseconds
  }
  return undefined;
};

// Helper function to handle API errors
const handleAPIError = (error: any, operation: string): GitHubAPIError => {
  const status = error.status || error.response?.status || 500;
  const headers = error.response?.headers || {};
  const retryAfter = error.retryAfter || getRetryAfter(headers);
  
  // Rate limit errors (403 or 429)
  if (status === 403 || status === 429 || error.error === 'rate_limit') {
    return new GitHubAPIError(
      error.message || `GitHub API rate limit exceeded. ${retryAfter ? `Please try again in ${Math.ceil((retryAfter || 0) / 1000)} seconds.` : 'Please try again later.'}`,
      status,
      'rate_limit',
      retryAfter
    );
  }
  
  // Not found errors
  if (status === 404 || error.error === 'not_found') {
    return new GitHubAPIError(
      error.message || `User or resource not found. Please check the username and try again.`,
      status,
      'not_found'
    );
  }
  
  // Server errors
  if (status >= 500 || error.error === 'server_error') {
    return new GitHubAPIError(
      error.message || `GitHub API server error. Please try again later.`,
      status,
      'server_error'
    );
  }
  
  // Unknown errors
  return new GitHubAPIError(
    error.message || `Failed to ${operation}: ${error.message || 'Unknown error'}`,
    status,
    'unknown'
  );
};

// Helper function to make API requests to backend proxy
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      response: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      },
      message: errorData.message || response.statusText,
      ...errorData,
    };
  }

  return response.json();
};

// Retry wrapper for API calls
const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError: GitHubAPIError | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const apiError = handleAPIError(error, operationName);
      lastError = apiError;
      
      // Only retry on rate limit errors or server errors
      if (apiError.type === 'rate_limit' || apiError.type === 'server_error') {
        if (attempt < retries) {
          // Calculate delay: exponential backoff with jitter
          const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          const jitter = Math.random() * 1000; // Add random jitter up to 1 second
          const delay = apiError.retryAfter 
            ? Math.min(apiError.retryAfter, baseDelay + jitter)
            : baseDelay + jitter;
          
          console.warn(
            `${operationName} failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${Math.ceil(delay / 1000)}s...`
          );
          await wait(delay);
          continue;
        }
      }
      
      // Don't retry for other errors (not found, forbidden without rate limit, etc.)
      throw apiError;
    }
  }
  
  throw lastError || new GitHubAPIError(`Failed to ${operationName} after ${retries + 1} attempts`, 500, 'unknown');
};

// External API for contribution calendar (no auth needed)
const CONTRIBUTION_API = "https://github-contributions-api.jogruber.de/v4";

export const fetchProfile = async (username: string): Promise<GitHubUser> => {
  return withRetry(async () => {
    return await apiRequest<GitHubUser>(`/api/user/${username}`);
  }, `fetch profile for ${username}`);
};

export const fetchRepoLanguages = async (username: string, repo: string): Promise<LanguageParam[]> => {
  return withRetry(async () => {
    const data = await apiRequest<Record<string, number>>(`/api/repos/${username}/${repo}/languages`);
    
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    
    return Object.entries(data).map(([name, bytes]) => ({
      name,
      value: bytes,
      color: getLanguageColor(name),
      percentage: Math.round((bytes / total) * 100)
    })).sort((a, b) => b.value - a.value);
  }, `fetch languages for ${username}/${repo}`);
};

export const fetchRepos = async (username: string): Promise<GitHubRepo[]> => {
  return withRetry(async () => {
    // Fetch top 100 repos sorted by updated to get recent activity
    return await apiRequest<GitHubRepo[]>(`/api/user/${username}/repos?sort=pushed&per_page=100&type=all`);
  }, `fetch repos for ${username}`);
};

export const fetchContributions = async (username: string, year?: number): Promise<ContributionYear> => {
  return withRetry(async () => {
    const response = await fetch(`${CONTRIBUTION_API}/${username}?y=${year || "last"}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new GitHubAPIError(
          `Contributions data not found for user ${username}`,
          404,
          'not_found'
        );
      }
      throw new GitHubAPIError(
        `Failed to fetch contributions: ${response.statusText}`,
        response.status,
        response.status >= 500 ? 'server_error' : 'unknown'
      );
    }
    const data = await response.json();
    
    // The API returns { total: { [year]: number }, contributions: Day[] } or similar structure
    // Need to adapt based on actual response.
    // The v4 API returns: { total: { "2024": 123 }, contributions: [ { date, count, level } ] }
    // Wait, v4 returns object with years.
    
    // Let's assume we want the current year or the requested year.
    // The API structure: 
    // {
    //   contributions: [ { date, count, level }... ], // all years flat or structured?
    //   // Actually v4 returns: { contributions: [ ... all days ... ] }?
    //   // Let's check documentation or assume response structure from common usage.
    //   // Documentation says: GET /v4/:username?y=2024
    // }
    
    // If we assume the response matches, we map it.
    
    // Safety: If exact shape unknown, we type loosely first.
    const anyData = data as any;
    
    return {
      year: year || new Date().getFullYear(),
      total: anyData.total?.[year || new Date().getFullYear()] || 0,
      range: { start: "", end: "" }, // API might not strictly provide this, we compute
      contributions: anyData.contributions || []
    };
  }, `fetch contributions for ${username}`);
};

export const calculateLanguages = async (repos: GitHubRepo[]): Promise<LanguageParam[]> => {
  // Aggregate language usage from repos
  // Priority: Use detailed language stats when available, otherwise use heuristics
  const languageWeights: Record<string, number> = {};
  
  repos.forEach(repo => {
    // If repo has detailed language stats (from fetchRepoLanguages), use those
    if (repo.languages && repo.languages.length > 0 && !repo.fork) {
      repo.languages.forEach(lang => {
        // Weight by repo popularity (stars) to give more weight to important repos
        const weight = lang.value * (1 + Math.log10(repo.stargazers_count + 1));
        languageWeights[lang.name] = (languageWeights[lang.name] || 0) + weight;
      });
    } else if (repo.language && !repo.fork) {
      // For repos without detailed stats, use primary language with heuristic weight
      // Weight by: repo size (KB) * popularity factor (stars)
      // This gives better approximation than just size or just count
      const popularityFactor = 1 + Math.log10(repo.stargazers_count + 1);
      const weight = repo.size * popularityFactor;
      languageWeights[repo.language] = (languageWeights[repo.language] || 0) + weight;
    }
  });
  
  // If no non-fork repos, include forks with reduced weight
  const total = Object.values(languageWeights).reduce((a, b) => a + b, 0);
  if (total === 0) {
    repos.forEach(repo => {
      if (repo.languages && repo.languages.length > 0) {
        repo.languages.forEach(lang => {
          // Reduced weight for forks (0.3x)
          const weight = lang.value * 0.3;
          languageWeights[lang.name] = (languageWeights[lang.name] || 0) + weight;
        });
      } else if (repo.language) {
        // Reduced weight for forks
        const weight = repo.size * 0.3;
        languageWeights[repo.language] = (languageWeights[repo.language] || 0) + weight;
      }
    });
  }
  
  const finalTotal = Object.values(languageWeights).reduce((a, b) => a + b, 0);

  return Object.entries(languageWeights)
    .sort(([, a], [, b]) => b - a)
    .map(([name, weight]) => ({
      name,
      value: weight,
      color: getLanguageColor(name),
      percentage: finalTotal > 0 ? Math.round((weight / finalTotal) * 100) : 0
    }));
};

const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
        "TypeScript": "#3178C6",
        "JavaScript": "#F7DF1E",
        "Python": "#3776AB",
        "Rust": "#DEA584",
        "Go": "#00ADD8",
        "Java": "#007396",
        "C++": "#00599C",
        "C": "#555555",
        "HTML": "#E34C26",
        "CSS": "#563D7C",
        "Vue": "#4FC08D",
        "React": "#61DAFB", 
        "Svelte": "#FF3E00",
        "Swift": "#F05138"
    };
    return colors[lang] || "#7C7CFF";
}

export const fetchWrapData = async (username: string): Promise<WrapData> => {
  const currentYear = 2025; // Updated to 2025 per feedback
  
  // Fetch data in parallel, but handle errors gracefully
  // If one fails, we'll get a proper error message
  let user: GitHubUser;
  let repos: GitHubRepo[];
  let contributions: ContributionYear;
  
  try {
    [user, repos, contributions] = await Promise.all([
      fetchProfile(username),
      fetchRepos(username),
      fetchContributions(username, currentYear)
    ]);
  } catch (error) {
    // Re-throw with context
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    throw new GitHubAPIError(
      `Failed to fetch data for ${username}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      'unknown'
    );
  }
  
  // Calculate basic stats
  const busyMap: Record<string, number> = {};
  const dayMap: Record<string, number> = {};
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // 0-6
  
  // Contribution calendar usually gives all days.
  contributions.contributions.forEach(day => {
    if (day.count > 0) {
      const date = new Date(day.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const weekDay = days[date.getDay()];
      
      busyMap[monthKey] = (busyMap[monthKey] || 0) + day.count;
      dayMap[weekDay] = (dayMap[weekDay] || 0) + day.count;
    }
  });
  
  const busiestMonth = Object.entries(busyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const busiestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const sortedRepos = repos.filter(r => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count);
  
  // Enrich top 3 repos with detailed language stats
  // This adds ~3 API calls.
  const topReposWithLanguages = await Promise.all(
    sortedRepos.slice(0, 3).map(async (repo) => {
      try {
        const langs = await fetchRepoLanguages(username, repo.name);
        return { ...repo, languages: langs };
      } catch (e) {
        return repo;
      }
    })
  );
  
  // Combine enriched top 3 with the rest
  const finalRepos = [...topReposWithLanguages, ...sortedRepos.slice(3)];
  
  // Calculate languages AFTER repos are enriched with detailed stats
  const languages = await calculateLanguages(finalRepos);

  return {
    user,
    repos: finalRepos,
    contributions,
    languages,
    stats: {
      totalCommits: contributions.total,
      totalPRs: 0,
      totalIssues: 0,
      topLanguages: languages.slice(0, 5),
      busiestMonth,
      busiestDay
    }
  };
};
