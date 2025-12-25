export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  languages_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  languages?: LanguageParam[]; // Detailed stats
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionYear {
  year: number;
  total: number;
  range: {
    start: string;
    end: string;
  };
  contributions: ContributionDay[];
}

export interface LanguageParam {
  name: string;
  value: number; // bytes
  color?: string;
  percentage?: number;
}

export interface WrapData {
  user: GitHubUser;
  repos: GitHubRepo[];
  contributions: ContributionYear; // Primary year
  languages: LanguageParam[];
  stats: {
    totalCommits: number; // derived from calendar
    totalPRs: number; // derived or estimated
    totalIssues: number;
    topLanguages: LanguageParam[];
    busiestMonth: string;
    busiestDay: string;
  };
}
