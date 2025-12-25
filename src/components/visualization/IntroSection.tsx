import { SectionWrapper } from "../layout/SectionWrapper";
import { motion } from "framer-motion";
import type { WrapData } from "../../types";

interface IntroSectionProps {
  data: WrapData;
}

export const IntroSection = ({ data }: IntroSectionProps) => {
  return (
    <SectionWrapper className="bg-backgroundDark">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img 
            src={data.user.avatar_url} 
            alt={data.user.login}
            className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto mb-8 border-4 border-white/10 shadow-2xl"
          />
        </motion.div>
        
        <h2 className="text-xl md:text-2xl text-accentDefault font-body mb-4 tracking-widest uppercase">
          2025 Wrapped
        </h2>
        
        <h1 className="text-5xl md:text-8xl font-display font-black leading-tight mb-6">
          This was your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentJS via-accentDefault to-accentPython animate-pulse">
            GitHub Year
          </span>
        </h1>
        
        <p className="text-2xl md:text-4xl text-textSecondary font-display">
          @{data.user.login}
        </p>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accentDefault rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accentPython rounded-full blur-[150px] animate-pulse-slow delay-1000" />
      </div>
    </SectionWrapper>
  );
};
