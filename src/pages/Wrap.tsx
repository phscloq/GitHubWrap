import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWrapData } from "../services/github";
import type { WrapData } from "../types";
import { GitHubAPIError } from "../utils/errors";
import { motion } from "framer-motion";
import { IntroSection } from "../components/visualization/IntroSection";
import { StatsSection } from "../components/visualization/StatsSection";
import { TimelineSection } from "../components/visualization/TimelineSection";
import { LanguagesSection } from "../components/visualization/LanguagesSection";
import { ReposSection } from "../components/visualization/ReposSection";
import { AchievementsSection } from "../components/visualization/AchievementsSection";
import { SummarySection } from "../components/visualization/SummarySection";
import { AlertCircle, RefreshCw } from "lucide-react";

export const Wrap = () => {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<WrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: string; retryAfter?: number } | null>(null);

  const loadData = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await fetchWrapData(username);
      setData(result);
    } catch (err) {
      if (err instanceof Error && 'status' in err && 'type' in err) {
        const apiError = err as GitHubAPIError;
        setError({
          message: apiError.message,
          type: apiError.type,
          retryAfter: apiError.retryAfter,
        });
      } else {
        setError({
          message: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
          type: 'unknown',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-backgroundDark">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl font-display font-bold"
        >
          Analyzing your 2025...
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    const isRateLimit = error?.type === 'rate_limit';
    const isNotFound = error?.type === 'not_found';
    const canRetry = isRateLimit || error?.type === 'server_error';
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-backgroundDark px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
              <AlertCircle className="text-red-400" size={48} />
            </div>
          </div>
          
          <h2 className="text-3xl font-display font-bold mb-4 text-white">
            {isRateLimit ? "Rate Limit Exceeded" : isNotFound ? "User Not Found" : "Error"}
          </h2>
          
          <p className="text-textSecondary text-lg mb-6 leading-relaxed">
            {error?.message || "An unexpected error occurred"}
          </p>
          
          {isRateLimit && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-400 mb-2">How to fix this:</h3>
              <ul className="text-textSecondary space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Wait a few minutes and try again (unauthenticated requests: 60/hour)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>
                    The backend server uses a GitHub token to increase the rate limit to 5,000 requests/hour.
                    If you're self-hosting, configure the token on the server side (see DEPLOYMENT.md).
                  </span>
                </li>
              </ul>
            </div>
          )}
          
          {isNotFound && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-textSecondary text-sm">
                Please check that the username is correct and the profile is public.
              </p>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            {canRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadData}
                className="flex items-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors"
              >
                <RefreshCw size={18} />
                Try Again
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-3 px-6 rounded-full hover:bg-white/20 transition-colors"
            >
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-backgroundDark text-white">
      <IntroSection data={data} />
      <StatsSection data={data} />
      <TimelineSection data={data} />
      <LanguagesSection data={data} />
      <ReposSection data={data} />
      <AchievementsSection data={data} />
      <SummarySection data={data} />
    </div>
  );
};
