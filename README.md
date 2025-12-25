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

### Prerequisites

- Node.js 18+ and npm
- A GitHub account (optional, for viewing your own data)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd github-wrap
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## GitHub Personal Access Token (Optional but Recommended)

**Why use a token?**
- **Without token**: 60 API requests/hour (unauthenticated)
- **With token**: 5,000 API requests/hour (authenticated)

Using a token significantly increases your rate limit and prevents rate limit errors when fetching data for users with many repositories.

### How to Get a GitHub Personal Access Token

#### Step 1: Go to GitHub Settings
1. Open [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Or navigate: GitHub Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

#### Step 2: Generate New Token
1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. You may be prompted to enter your GitHub password for security

#### Step 3: Configure Token
1. **Note**: Give it a descriptive name (e.g., "GitHub Wrap App")
2. **Expiration**: Choose an expiration period (30 days, 60 days, 90 days, or custom)
3. **Scopes**: 
   - **No scopes needed!** This app only reads public data, so you don't need to select any scopes
   - The token will work with default public read permissions

#### Step 4: Generate and Copy
1. Scroll down and click **"Generate token"**
2. **Important**: Copy the token immediately - you won't be able to see it again!
3. The token will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Setting Up the Token

1. Create a `.env` file in the root directory of the project:
```bash
touch .env
```

2. Add your token to the `.env` file:
```env
VITE_GITHUB_TOKEN=ghp_your_token_here
```

3. **Restart your development server** for the changes to take effect:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### Security Notes

- ✅ The `.env` file is already in `.gitignore` - your token won't be committed
- ✅ Never share your token publicly
- ✅ If your token is compromised, revoke it immediately in GitHub settings
- ✅ Tokens can be revoked or regenerated at any time

### Troubleshooting

**Token not working?**
- Make sure the token starts with `ghp_`
- Verify the `.env` file is in the root directory (same level as `package.json`)
- Ensure you restarted the dev server after adding the token
- Check that the token hasn't expired

**Still getting rate limit errors?**
- Verify your token is being loaded: check the browser console for any errors
- Try generating a new token
- Wait a few minutes if you've hit the limit

## Usage

1. Enter a GitHub username in the search field
2. Click "Wrap My Year" to generate the visualization
3. Explore your GitHub activity data!

## Project Structure

```
github-wrap/
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Layout components
│   │   └── visualization/  # Visualization sections
│   ├── pages/           # Page components
│   ├── services/        # API services (GitHub API)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions and error handling
├── public/              # Static assets
└── .env                 # Environment variables (create this)
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
- **Octokit** - GitHub API client
- **React Router** - Routing

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
