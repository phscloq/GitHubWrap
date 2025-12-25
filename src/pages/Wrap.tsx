import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWrapData } from "../services/github";
import type { WrapData } from "../types";
import { motion } from "framer-motion";
import { IntroSection } from "../components/visualization/IntroSection";
import { StatsSection } from "../components/visualization/StatsSection";
import { TimelineSection } from "../components/visualization/TimelineSection";
import { LanguagesSection } from "../components/visualization/LanguagesSection";
import { ReposSection } from "../components/visualization/ReposSection";
import { AchievementsSection } from "../components/visualization/AchievementsSection";
import { SummarySection } from "../components/visualization/SummarySection";

export const Wrap = () => {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<WrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchWrapData(username);
        setData(result);
      } catch (err) {
        setError("User not found or API limit reached.");
      } finally {
        setLoading(false);
      }
    };

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-textSecondary">{error}</p>
        </div>
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
