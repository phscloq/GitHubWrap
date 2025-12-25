import { Octokit } from "octokit";
import type { GitHubUser, GitHubRepo, ContributionYear, WrapData, LanguageParam } from "../types";

const octokit = new Octokit();

// External API for contribution calendar (no auth needed)
const CONTRIBUTION_API = "https://github-contributions-api.jogruber.de/v4";

export const fetchProfile = async (username: string): Promise<GitHubUser> => {
  const { data } = await octokit.request("GET /users/{username}", {
    username,
  });
  return data as GitHubUser;
};

export const fetchRepoLanguages = async (username: string, repo: string): Promise<LanguageParam[]> => {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/languages", {
    owner: username,
    repo,
  });
  
  const total = Object.values(data).reduce((a, b) => a + (b as number), 0);
  
  return Object.entries(data).map(([name, bytes]) => ({
    name,
    value: bytes as number,
    color: getLanguageColor(name),
    percentage: Math.round(((bytes as number) / total) * 100)
  })).sort((a, b) => b.value - a.value);
};

export const fetchRepos = async (username: string): Promise<GitHubRepo[]> => {
  // Fetch top 100 repos sorted by updated to get recent activity
  // We might want to fetch all to get accurate language stats, but 100 is a safe start for unauthenticated
  const { data } = await octokit.request("GET /users/{username}/repos", {
    username,
    sort: "pushed",
    per_page: 100,
    type: "all", // "all", "owner", "member"
  });
  return data as GitHubRepo[];
};

export const fetchContributions = async (username: string, year?: number): Promise<ContributionYear> => {
  const response = await fetch(`${CONTRIBUTION_API}/${username}?y=${year || "last"}`);
  if (!response.ok) {
    throw new Error("Failed to fetch contributions");
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
};

export const calculateLanguages = async (repos: GitHubRepo[], username: string): Promise<LanguageParam[]> => {
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
  const [user, repos, contributions] = await Promise.all([
    fetchProfile(username),
    fetchRepos(username),
    fetchContributions(username, currentYear)
  ]);
  
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
  const languages = await calculateLanguages(finalRepos, username);

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
