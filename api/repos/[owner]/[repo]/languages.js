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
        message: 'Repository not found.'
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
  // CORS: On Vercel, frontend and API are same domain, so allow same origin
  const origin = req.headers.origin;
  
  if (origin) {
    // Allow same origin (Vercel) or configured FRONTEND_URL
    const host = req.headers.host;
    const isSameOrigin = origin.includes(host);
    const isConfigured = process.env.FRONTEND_URL && origin.includes(new URL(process.env.FRONTEND_URL).hostname);
    
    if (isSameOrigin || isConfigured) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  // If no origin header, it's a same-origin request (no CORS needed)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { owner, repo } = req.query;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const { data } = await octokit.request('GET /repos/{owner}/{repo}/languages', {
      owner,
      repo,
    });
    
    return res.status(200).json(data);
  } catch (error) {
    const errorResponse = handleError(error);
    return res.status(errorResponse.status).json(errorResponse.body);
  }
}

