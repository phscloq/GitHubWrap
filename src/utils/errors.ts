// Error types for better error handling
export class GitHubAPIError extends Error {
  public status: number;
  public type: 'rate_limit' | 'forbidden' | 'not_found' | 'server_error' | 'unknown';
  public retryAfter?: number;

  constructor(
    message: string,
    status: number,
    type: 'rate_limit' | 'forbidden' | 'not_found' | 'server_error' | 'unknown',
    retryAfter?: number
  ) {
    super(message);
    this.name = 'GitHubAPIError';
    this.status = status;
    this.type = type;
    this.retryAfter = retryAfter;
  }
}

