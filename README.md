# GitHub Wrap

A beautiful visualization of your GitHub activity for the year. Generate your personalized GitHub year-in-review wrap.

## Features

- 📊 **Comprehensive Stats**: View your commits, contributions, and activity patterns
- 🎨 **Beautiful Visualizations**: Interactive charts and graphs for your coding journey
- 🌈 **Language Breakdown**: See which programming languages you used most
- ⭐ **Top Repositories**: Discover your most starred and active projects
- 📅 **Timeline View**: Visualize your activity throughout the year
- 🏆 **Achievements**: Celebrate your coding milestones

## Getting Started

See **[QUICK_START.md](./QUICK_START.md)** for detailed setup instructions.

### Quick Overview

**For Local Development:**
1. **Install dependencies** (frontend and backend)
2. **Start the backend server** (Express server in `server/` folder)
3. **Start the frontend** (React app)
4. **Open in browser** and start exploring!

**For Vercel Deployment:**
- The `api/` folder contains serverless functions that work automatically on Vercel
- No need to run a separate server - Vercel handles it
- See `VERCEL_DEPLOYMENT.md` for details

The backend proxy ensures your GitHub token (if used) is never exposed to the browser.

## Architecture

This application uses a **secure backend proxy** to handle GitHub API requests. The token is stored server-side only and never exposed to the browser.

- **Frontend**: React/Vite application (static files)
- **Backend**: 
  - **Vercel**: Serverless functions in `api/` folder (for Vercel deployment)
  - **Other platforms**: Express server in `server/` folder (for Railway, Render, etc.)

See `DEPLOYMENT.md` for setup instructions, `VERCEL_DEPLOYMENT.md` for Vercel-specific guide, and `SECURITY.md` for security details.

## Usage

1. Enter a GitHub username in the search field
2. Click "Wrap My Year" to generate the visualization
3. Explore your GitHub activity data!

## Project Structure

```
github-wrap/
├── api/                 # Vercel serverless functions (for Vercel deployment)
│   ├── user/            # User-related API routes
│   └── repos/           # Repository-related API routes
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Layout components
│   │   └── visualization/  # Visualization sections
│   ├── pages/           # Page components
│   ├── services/        # API services (GitHub API via proxy)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions and error handling
├── server/              # Express server (for local dev or separate deployment)
│   ├── index.js         # Express server
│   └── package.json     # Server dependencies
├── public/              # Static assets
├── vercel.json          # Vercel configuration
├── SECURITY.md          # Security guide
├── DEPLOYMENT.md        # General deployment instructions
├── VERCEL_DEPLOYMENT.md # Vercel-specific deployment guide
└── QUICK_START.md       # Quick start guide
```

## Error Handling

The app includes comprehensive error handling:

- **Rate Limit Errors**: Automatic retry with exponential backoff
- **User Not Found**: Clear error messages
- **Network Errors**: Graceful error handling with retry options
- **User-Friendly Messages**: Actionable guidance for resolving issues

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Express** - Backend proxy server
- **Octokit** - GitHub API client (server-side only)
- **React Router** - Routing

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
