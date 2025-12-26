import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { Download, ExternalLink, Share2, X, MessageCircle, Instagram, Facebook, Linkedin, Copy, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import baranProfile from "../../assets/baran.jpg";

interface SummarySectionProps {
  data: WrapData;
}

export const SummarySection = ({ data }: SummarySectionProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

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

  const getShareText = () => {
    const url = window.location.href;
    const topLanguage = data.stats.topLanguages[0]?.name || "Code";
    return `🚀 My 2025 GitHub Wrap! 

📊 ${data.stats.totalCommits.toLocaleString()} contributions
💻 Top language: ${topLanguage}
📅 Busiest month: ${data.stats.busiestMonth}

Check out my GitHub year: ${url}`;
  };

  const generateImage = async (): Promise<string | null> => {
    if (imageDataUrl) return imageDataUrl;
    
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        setImageDataUrl(dataUrl);
        return dataUrl;
      } catch (err) {
        console.error('Failed to generate image:', err);
        return null;
      }
    }
    return null;
  };

  const handleShareClick = async () => {
    // Generate image first
    await generateImage();
    setShowShareMenu(true);
  };

  const shareToPlatform = async (platform: string) => {
    const shareText = getShareText();
    const url = window.location.href;
    const imageUrl = await generateImage();

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      
      case 'x':
      case 'twitter':
        // X/Twitter - text only (can't attach image via URL)
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank', 'width=550,height=420');
        break;
      
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
        break;
      
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      
      case 'instagram':
        // Instagram doesn't support web sharing, so copy image and text
        if (imageUrl) {
          try {
            const blob = await fetch(imageUrl).then(r => r.blob());
            const file = new File([blob], `github-wrap-${data.user.login}.png`, { type: 'image/png' });
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': file })
            ]);
            alert('Image copied! Open Instagram and paste it. Text copied to clipboard.');
            await navigator.clipboard.writeText(shareText);
          } catch (err) {
            console.error('Failed to copy image:', err);
            await navigator.clipboard.writeText(shareText);
            alert('Text copied! Open Instagram and create a post.');
          }
        } else {
          await navigator.clipboard.writeText(shareText);
          alert('Text copied! Open Instagram and create a post.');
        }
        break;
      
      case 'native':
        // Native share with image
        if (navigator.share && imageUrl) {
          try {
            const blob = await fetch(imageUrl).then(r => r.blob());
            const file = new File([blob], `github-wrap-${data.user.login}.png`, { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `My 2025 GitHub Wrap - @${data.user.login}`,
                text: shareText,
                files: [file],
              });
            } else {
              await navigator.share({
                title: `My 2025 GitHub Wrap - @${data.user.login}`,
                text: shareText,
                url: url,
              });
            }
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Share failed:', err);
            }
          }
        }
        break;
      
      case 'copy':
        await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
        alert('Link copied to clipboard!');
        break;
    }
    
    setShowShareMenu(false);
  };

  const sharePlatforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { id: 'x', name: 'X (Twitter)', icon: X, color: '#000000' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    ...(typeof navigator !== 'undefined' && 'share' in navigator ? [{ id: 'native', name: 'More', icon: Share2, color: '#7C7CFF' }] : []),
    { id: 'copy', name: 'Copy Link', icon: Copy, color: '#6B7280' },
  ];

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


          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="text-2xl font-display font-black tracking-tighter whitespace-nowrap">
              GITHUB WRAP
            </div>
            <div className="text-xs text-textSecondary text-right">
              githubwrap25.vercel.app
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-12 justify-center relative">
           <button 
             onClick={handleDownload}
             disabled={isGenerating}
             className="flex items-center gap-2 px-6 md:px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
           >
             <Download size={20} />
             <span className="hidden sm:inline">{isGenerating ? "Exporting..." : "Download Image"}</span>
             <span className="sm:hidden">{isGenerating ? "Exporting..." : "Download"}</span>
           </button>

           <button
             onClick={handleShareClick}
             className="flex items-center gap-2 px-6 md:px-8 py-4 bg-accentDefault text-white rounded-full font-bold hover:bg-accentDefault/90 transition-colors"
           >
             <Share2 size={20} />
             <span>Share</span>
           </button>

           {/* Share Menu Modal */}
           <AnimatePresence>
             {showShareMenu && (
               <>
                 {/* Backdrop */}
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setShowShareMenu(false)}
                   className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                 />
                 
                 {/* Share Menu */}
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95, y: 20 }}
                   className="fixed inset-0 z-50 flex items-center justify-center p-4"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                     <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-bold">Share your GitHub Wrap</h3>
                       <button
                         onClick={() => setShowShareMenu(false)}
                         className="p-2 hover:bg-white/10 rounded-full transition-colors"
                       >
                         <CloseIcon size={20} />
                       </button>
                     </div>
                     
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {sharePlatforms.map((platform) => {
                         const Icon = platform.icon;
                         return (
                           <button
                             key={platform.id}
                             onClick={() => shareToPlatform(platform.id)}
                             className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                           >
                             <div
                               className="p-3 rounded-full"
                               style={{ backgroundColor: `${platform.color}20` }}
                             >
                               <Icon
                                 size={24}
                                 className="group-hover:scale-110 transition-transform"
                                 style={{ color: platform.color }}
                               />
                             </div>
                             <span className="text-sm font-medium text-center">{platform.name}</span>
                           </button>
                         );
                       })}
                     </div>
                   </div>
                 </motion.div>
               </>
             )}
           </AnimatePresence>
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
