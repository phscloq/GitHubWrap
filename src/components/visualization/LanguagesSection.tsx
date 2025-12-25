import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { motion } from "framer-motion";

interface LanguagesSectionProps {
  data: WrapData;
}

export const LanguagesSection = ({ data }: LanguagesSectionProps) => {
  const topLanguages = data.stats.topLanguages;
  const primaryLang = topLanguages[0];

  return (
    <SectionWrapper>
      <div className="flex flex-col items-center w-full">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-12 text-center">
          You spoke in <br />
          <span style={{ color: primaryLang?.color || "#fff" }}>
            {primaryLang?.name || "Code"}
          </span>
        </h2>

        <div className="w-full max-w-3xl space-y-6">
          {topLanguages.map((lang, index) => (
            <motion.div
              key={lang.name}
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: `${lang.percentage}%`, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
              className="relative group"
            >
              <div className="flex items-center justify-between mb-2 text-lg">
                <span className="font-bold">{lang.name}</span>
                <span className="text-textSecondary">{lang.percentage}%</span>
              </div>
              <div className="h-4 md:h-6 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ backgroundColor: lang.color || "#7C7CFF" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
