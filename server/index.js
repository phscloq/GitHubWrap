import express from 'express';
import cors from 'cors';
import { Octokit } from 'octokit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize Octokit with token from server-side environment (NOT exposed to client)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined, // Server-side only, never exposed
});

// Rate limiting helper
const getRetryAfter = (headers) => {
  const retryAfter = headers['retry-after'] || headers['x-ratelimit-reset'];
  if (retryAfter) {
    const resetTime = parseInt(retryAfter, 10);
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, (resetTime - now) * 1000);
  }
  return undefined;
};

// Error handler
const handleError = (error, res) => {
  const status = error.status || error.response?.status || 500;
  const headers = error.response?.headers || {};
  
  if (status === 403 || status === 429) {
    const retryAfter = getRetryAfter(headers);
    return res.status(status).json({
      error: 'rate_limit',
      message: `GitHub API rate limit exceeded. ${retryAfter ? `Please try again in ${Math.ceil((retryAfter || 0) / 1000)} seconds.` : 'Please try again later.'}`,
      retryAfter
    });
  }
  
  if (status === 404) {
    return res.status(404).json({
      error: 'not_found',
      message: 'User or resource not found. Please check the username and try again.'
    });
  }
  
  if (status >= 500) {
    return res.status(500).json({
      error: 'server_error',
      message: 'GitHub API server error. Please try again later.'
    });
  }
  
  return res.status(status).json({
    error: 'unknown',
    message: error.message || 'Unknown error occurred'
  });
};

// API Routes

// Get user profile
app.get('/api/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { data } = await octokit.request('GET /users/{username}', {
      username,
    });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
});

// Get user repositories
app.get('/api/user/:username/repos', async (req, res) => {
  try {
    const { username } = req.params;
    const { sort = 'pushed', per_page = 100, type = 'all' } = req.query;
    
    const { data } = await octokit.request('GET /users/{username}/repos', {
      username,
      sort,
      per_page: parseInt(per_page, 10),
      type,
    });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
});

// Get repository languages
app.get('/api/repos/:owner/:repo/languages', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/languages', {
      owner,
      repo,
    });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GitHub API Proxy Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔐 GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ Configured' : '❌ Not configured (using unauthenticated requests)'}`);
});

