import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface ReposSectionProps {
  data: WrapData;
}

export const ReposSection = ({ data }: ReposSectionProps) => {
  const topRepos = data.repos.slice(0, 3);

  return (
    <SectionWrapper>
      <div className="w-full text-center md:text-left">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-12">
          Your Main Stages
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topRepos.map((repo, index) => (
            <motion.a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              key={repo.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="block p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group text-left"
            >
              <h3 className="text-2xl font-bold mb-4 break-words group-hover:text-accentDefault transition-colors">
                {repo.name}
              </h3>
              <p className="text-textSecondary text-sm mb-6 line-clamp-3 h-12">
                {repo.description || "No description provided."}
              </p>
              
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-6 text-sm text-textSecondary">
                    <div className="flex items-center gap-2">
                    <Star size={16} className="text-accentJS" />
                    <span>{repo.stargazers_count}</span>
                    </div>
                </div>

                {/* Detailed Language Bar */}
                {repo.languages && repo.languages.length > 0 ? (
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/10">
                        {repo.languages.slice(0, 5).map((lang) => (
                            <div 
                                key={lang.name}
                                style={{ width: `${lang.percentage}%`, backgroundColor: lang.color || "#7C7CFF" }}
                                className="h-full"
                                title={`${lang.name}: ${lang.percentage}%`}
                            />
                        ))}
                    </div>
                ) : repo.language && (
                     /* Fallback */
                    <div className="flex items-center gap-2 text-sm text-textSecondary">
                        <div className="w-3 h-3 rounded-full bg-accentDefault" />
                        <span>{repo.language}</span>
                    </div>
                )}
                
                {repo.languages && (
                    <div className="flex flex-wrap gap-2 text-xs text-textSecondary">
                        {repo.languages.slice(0, 3).map(lang => (
                             <span key={lang.name} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: lang.color }}></span>
                                {lang.name} <span className="opacity-50">{lang.percentage}%</span>
                             </span>
                        ))}
                    </div>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
