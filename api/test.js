// Test endpoint to verify API routes are working
export default async function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasToken: !!process.env.GITHUB_TOKEN
  });
}

