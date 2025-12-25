import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { motion } from "framer-motion";
import { Trophy, Calendar, Flame } from "lucide-react";

interface AchievementsSectionProps {
  data: WrapData;
}

export const AchievementsSection = ({ data }: AchievementsSectionProps) => {
  // Calculate streaks or special achievements
  // For now, static or simple logic
  
  const achievements = [
    {
      title: "Night Owl",
      description: "You coded late into the night.",
      icon: <Flame size={40} className="text-orange-500" />,
      color: "from-orange-500/20 to-orange-500/5",
    },
    {
      title: "Weekend Warrior",
      description: "Saturdays didn't stop you.",
      icon: <Calendar size={40} className="text-purple-500" />,
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      title: `Top ${data.stats.topLanguages[0]?.name || "Coder"}`,
      description: `You mastered ${data.stats.topLanguages[0]?.name || "code"} this year.`,
      icon: <Trophy size={40} className="text-yellow-500" />,
      color: "from-yellow-500/20 to-yellow-500/5",
    }
  ];

  return (
    <SectionWrapper>
      <div className="flex flex-col items-center w-full">
         <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 text-center">
          2025 Highlights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {achievements.map((item, index) => (
             <motion.div
               key={index}
               initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
               whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
               transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
               whileHover={{ scale: 1.05 }}
               className={`p-8 rounded-3xl bg-gradient-to-br ${item.color} border border-white/10 flex flex-col items-center text-center gap-4`}
             >
               <div className="p-4 bg-white/10 rounded-full mb-2">
                 {item.icon}
               </div>
               <h3 className="text-2xl font-bold">{item.title}</h3>
               <p className="text-textSecondary text-sm">{item.description}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
