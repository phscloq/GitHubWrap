import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { motion } from "framer-motion";

interface TimelineSectionProps {
  data: WrapData;
}

export const TimelineSection = ({ data }: TimelineSectionProps) => {
  // We need to visualize the rhythm.
  // Let's use `data.contributions.contributions`
  // We can group by month and show a vertical bar chart.
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyCounts = new Array(12).fill(0);
  
  data.contributions.contributions.forEach(day => {
    const month = new Date(day.date).getMonth();
    monthlyCounts[month] += day.count;
  });
  
  const max = Math.max(...monthlyCounts);

  return (
    <SectionWrapper>
      <div className="flex flex-col items-center w-full h-full justify-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 text-center">
          Your 2025 Rhythm
        </h2>

        <div className="items-end justify-center w-full h-[400px] gap-2 md:gap-6 flex">
          {monthlyCounts.map((count, index) => (
            <div key={index} className="flex flex-col items-center gap-4 group w-full max-w-[60px] h-full justify-end">
              <motion.div
                initial={{ height: "0%", opacity: 0.3 }}
                whileInView={{ height: `${Math.max((count / max) * 100, 2)}%`, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }} // Custom easing for "rising tower" feel
                className="w-full bg-gradient-to-t from-white/5 to-accentDefault rounded-t-lg relative group-hover:from-white/20 group-hover:to-accentDefault/80 transition-all shadow-[0_0_20px_rgba(124,124,255,0.2)]"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-backgroundDark text-xs font-bold py-1 px-2 rounded whitespace-nowrap z-20">
                  {count} contributions
                </div>
              </motion.div>
              <div className="text-textSecondary text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
                {months[index]}
              </div>
            </div>
          ))}
        </div>
        
        <p className="mt-12 text-xl text-textSecondary">
          Busiest in <span className="text-white font-bold">{data.stats.busiestMonth}</span>
        </p>
      </div>
    </SectionWrapper>
  );
};
