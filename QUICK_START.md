# Quick Start Guide

Get GitHub Wrap running locally in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Step 1: Clone and Install

```bash
git clone <repository-url>
cd github-wrap
npm install
```

## Step 2: Start Backend Server

For local development, use the Express server in the `server/` folder:

```bash
cd server
npm install

# Create .env file
echo "GITHUB_TOKEN=ghp_your_token_here" > .env
echo "FRONTEND_URL=http://localhost:5173" >> .env
echo "PORT=3001" >> .env
# Edit .env and add your GitHub token (optional but recommended)

# Start server
npm run dev
```

The backend will run on `http://localhost:3001`

**Note:** 
- The GitHub token is optional. Without it, you'll have a rate limit of 60 requests/hour. With a token, you get 5,000 requests/hour.
- For Vercel deployment, the `api/` folder contains serverless functions that work automatically (no separate server needed). See `VERCEL_DEPLOYMENT.md` for Vercel setup.

## Step 3: Start Frontend

Open a new terminal:

```bash
# From project root
cd ..

# Create .env file (if not exists)
echo "VITE_API_URL=http://localhost:3001" > .env

# Start frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Step 4: Open in Browser

Navigate to `http://localhost:5173` and start exploring!

## Getting a GitHub Token (Optional)

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "GitHub Wrap")
4. **No scopes needed** - this app only reads public data
5. Copy the token and add it to `server/.env`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```
6. Restart the backend server

## Troubleshooting

**Backend won't start:**
- Check Node.js version: `node --version` (should be 18+)
- Verify port 3001 is available
- Check `server/.env` file exists

**Frontend can't connect to backend:**
- Verify backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Check browser console for CORS errors

**Rate limit errors:**
- Add a GitHub token to `server/.env`
- Wait a few minutes if you've hit the limit
- Check token hasn't expired

## Understanding the Project Structure

This project has two backend options:

- **`api/` folder**: Vercel serverless functions (for Vercel deployment)
  - Automatically works when deployed to Vercel
  - No separate server process needed
  - See `VERCEL_DEPLOYMENT.md` for details

- **`server/` folder**: Express server (for local dev or separate backend deployment)
  - Used for local development (this guide)
  - Can be deployed separately to Railway, Render, Heroku, etc.
  - See `DEPLOYMENT.md` for other hosting options

## Next Steps

- Read `SECURITY.md` for security best practices
- Read `VERCEL_DEPLOYMENT.md` for Vercel deployment (recommended)
- Read `DEPLOYMENT.md` for other hosting platforms
- Check `README.md` for project overview

