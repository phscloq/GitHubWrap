import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import baranProfile from "../../assets/baran.jpg";

interface SummarySectionProps {
  data: WrapData;
}

export const SummarySection = ({ data }: SummarySectionProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (cardRef.current) {
      setIsGenerating(true);
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `github-wrap-${data.user.login}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <SectionWrapper>
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-display font-bold mb-8 text-center opacity-50">
          That's a wrap.
        </h2>

        {/* The Card */}
        <div 
          ref={cardRef}
          className="bg-[#0B0D10] w-[350px] md:w-[400px] aspect-[4/5] md:aspect-[4/4.2] p-8 rounded-3xl border border-white/10 relative overflow-hidden 
          flex flex-col shadow-2xl justify-between"
        >
          {/* Background decoration for the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accentDefault/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accentJS/10 rounded-full blur-[80px]" />

          <div className="relative z-10  flex flex-col min-h-0">
             <div className="flex items-center gap-4 mb-6">
                <img src={data.user.avatar_url} className="w-16 h-16 rounded-full border border-white/20" />
                <div>
                  <h3 className="text-xl font-bold font-display">@{data.user.login}</h3>
                  <p className="text-sm text-textSecondary">2025 GitHub Wrap</p>
                </div>
             </div>

             <div className="space-y-6 ">
                <div>
                   <div className="text-sm text-textSecondary uppercase tracking-widest mb-1">Total Contributions</div>
                   <div className="text-5xl font-black font-display leading-none">{data.stats.totalCommits.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-textSecondary uppercase tracking-widest mb-1">Top Language</div>
                    <div className="text-xl font-bold" style={{ color: data.stats.topLanguages[0]?.color || "white" }}>
                      {data.stats.topLanguages[0]?.name || "Code"}
                    </div>
                  </div>
                   <div>
                    <div className="text-xs text-textSecondary uppercase tracking-widest mb-1">Busiest Month</div>
                    <div className="text-xl font-bold">{data.stats.busiestMonth}</div>
                  </div>
                </div>
                
                 <div>
                    <div className="text-xs text-textSecondary uppercase tracking-widest mb-1">Active Days</div>
                    {/* Visual representation of activity pattern - show last 20 days from today */}
                    <div className="flex gap-1 h-3 mt-2">
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Filter contributions from the current year up to today
                        const currentYearContributions = data.contributions.contributions.filter(day => {
                          const dayDate = new Date(day.date);
                          dayDate.setHours(0, 0, 0, 0);
                          return dayDate <= today && dayDate.getFullYear() === today.getFullYear();
                        });
                        
                        // Get the last 20 days from today backwards
                        const last20Days: Array<{ date: string; count: number }> = [];
                        for (let i = 19; i >= 0; i--) {
                          const date = new Date(today);
                          date.setDate(date.getDate() - i);
                          const dateStr = date.toISOString().split('T')[0];
                          
                          const contribution = currentYearContributions.find(d => d.date === dateStr);
                          last20Days.push(contribution || { date: dateStr, count: 0 });
                        }
                        
                        return last20Days.map((day, i) => {
                          const intensity = day.count > 0 
                            ? Math.min(0.4 + (day.count / 10) * 0.6, 1) 
                            : 0.15;
                          return (
                            <div 
                              key={i} 
                              className="flex-1 rounded-sm" 
                              style={{ 
                                backgroundColor: day.count > 0 
                                  ? `rgba(124, 124, 255, ${intensity})` 
                                  : 'rgba(255, 255, 255, 0.1)'
                              }} 
                              title={day.count > 0 ? `${day.count} contributions on ${day.date}` : 'No contributions'}
                            />
                          );
                        });
                      })()}
                    </div>
                 </div>
             </div>
          </div>


          <div className="relative z-10 flex justify-between items-end gap-4">
            <div className="text-2xl font-display font-black tracking-tighter whitespace-nowrap">
              GITHUB WRAP
            </div>
            <div className="text-xs text-textSecondary text-right">
              github-wrap.vercel.app
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-12">
           <button 
             onClick={handleDownload}
             disabled={isGenerating}
             className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
           >
             <Download size={20} />
             {isGenerating ? "Exporting..." : "Download Image"}
           </button>
        </div>

        {/* Footer with links */}
        <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-2xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden">
                <img 
                  src={baranProfile} 
                  alt="Baran Dogan" 
                  className="w-full h-full object-cover"
                  style={{ transform: 'scale(1.5)', objectPosition: 'center 95%' }}
                />
              </div>
              <div className="text-sm text-textSecondary">
                <p className="font-semibold text-white">Y. Baran Dogan</p>
                <p>Developer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://www.ybarandogan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                <span>Portfolio</span>
                <ExternalLink size={14} />
              </a>
              
              <a
                href="https://apps.apple.com/us/app/gutlog-ibs-stool-tracker/id6749550927"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                <span>GutLog iOS</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
