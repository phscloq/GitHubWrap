import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { useSpring, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatsSectionProps {
  data: WrapData;
}

const CountUp = ({ value, label }: { value: number; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const springValue = useSpring(0, { duration: 2000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <div ref={ref} className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
      <div className="text-6xl md:text-8xl font-display font-black mb-2 tabular-nums text-white">
        {displayValue.toLocaleString()}
      </div>
      <div className="text-lg text-textSecondary font-body uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

export const StatsSection = ({ data }: StatsSectionProps) => {
  return (
    <SectionWrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full items-center">
        <div>
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
            You showed up. <br />
            <span className="text-textSecondary">Day after day.</span>
          </h2>
          <p className="text-xl text-textSecondary mb-8 max-w-md">
            Every green square tells a story of problem solving, learning, and building.
          </p>
        </div>
        
        <div className="space-y-6">
          <CountUp value={data.stats.totalCommits} label="Total Contributions" />
          <div className="grid grid-cols-2 gap-4">
             {/* Fallbacks since we might not have exact numbers for PRs/Issues without auth */}
             {data.user.public_repos > 0 && (
               <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <div className="text-4xl font-display font-bold mb-1">{data.user.public_repos}</div>
                  <div className="text-sm text-textSecondary uppercase">Public Repos</div>
               </div>
             )}
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <div className="text-4xl font-display font-bold mb-1">{data.user.followers}</div>
                  <div className="text-sm text-textSecondary uppercase">Followers</div>
               </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
