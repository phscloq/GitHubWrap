import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

const getRetryAfter = (headers) => {
  const retryAfter = headers['retry-after'] || headers['x-ratelimit-reset'];
  if (retryAfter) {
    const resetTime = parseInt(retryAfter, 10);
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, (resetTime - now) * 1000);
  }
  return undefined;
};

const handleError = (error) => {
  const status = error.status || error.response?.status || 500;
  const headers = error.response?.headers || {};
  
  if (status === 403 || status === 429) {
    const retryAfter = getRetryAfter(headers);
    return {
      status,
      body: {
        error: 'rate_limit',
        message: `GitHub API rate limit exceeded. ${retryAfter ? `Please try again in ${Math.ceil((retryAfter || 0) / 1000)} seconds.` : 'Please try again later.'}`,
        retryAfter
      }
    };
  }
  
  if (status === 404) {
    return {
      status: 404,
      body: {
        error: 'not_found',
        message: 'User or resource not found. Please check the username and try again.'
      }
    };
  }
  
  if (status >= 500) {
    return {
      status: 500,
      body: {
        error: 'server_error',
        message: 'GitHub API server error. Please try again later.'
      }
    };
  }
  
  return {
    status,
    body: {
      error: 'unknown',
      message: error.message || 'Unknown error occurred'
    }
  };
};

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173'];
  
  if (origin && allowedOrigins.some(allowed => {
    const cleanAllowed = allowed.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return cleanOrigin === cleanAllowed || cleanOrigin.includes(cleanAllowed);
  })) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query;
    const { sort = 'pushed', per_page = 100, type = 'all' } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const { data } = await octokit.request('GET /users/{username}/repos', {
      username,
      sort,
      per_page: parseInt(per_page, 10),
      type,
    });
    
    return res.status(200).json(data);
  } catch (error) {
    const errorResponse = handleError(error);
    return res.status(errorResponse.status).json(errorResponse.body);
  }
}

