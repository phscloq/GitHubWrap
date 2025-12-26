import { SectionWrapper } from "../layout/SectionWrapper";
import type { WrapData } from "../../types";
import { toPng } from "html-to-image";
import { useRef, useState, useEffect } from "react";
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
  
  // State to hold the "local" base64 version of the avatar
  const [safeAvatarUrl, setSafeAvatarUrl] = useState<string>(data.user.avatar_url);

  // 1. PRE-LOAD AVATAR: Fetch avatar as Blob to bypass CORS during canvas generation
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const response = await fetch(data.user.avatar_url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setSafeAvatarUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.warn("Could not convert avatar to data URL, falling back to original url", error);
      }
    };

    loadAvatar();
  }, [data.user.avatar_url]);

  const getShareText = () => {
    const topLanguage = data.stats.topLanguages[0]?.name || "Code";
    return `🚀 My 2025 GitHub Wrap! \n\n📊 ${data.stats.totalCommits.toLocaleString()} contributions\n💻 Top language: ${topLanguage}\n📅 Busiest month: ${data.stats.busiestMonth}\n\nCheck out my GitHub year:`;
  };

  const generateImage = async (): Promise<string | null> => {
    if (imageDataUrl) return imageDataUrl;
    
    if (cardRef.current) {
      try {
        // Simple delay to ensure fonts/images are rendered
        await new Promise(resolve => setTimeout(resolve, 100));

        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2, // Higher quality
          backgroundColor: '#0B0D10',
          // skipAutoScale helps with consistent sizing
          skipAutoScale: true, 
        });
        
        setImageDataUrl(dataUrl);
        return dataUrl;
      } catch (err) {
        console.error('Failed to generate image:', err);
        return null;
      }
    }
    return null;
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      setIsGenerating(true);
      try {
        const dataUrl = await generateImage();
        if (dataUrl) {
            const link = document.createElement("a");
            link.download = `github-wrap-${data.user.login}.png`;
            link.href = dataUrl;
            link.click();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleShareClick = async () => {
    // We do NOT wait for generation here to keep UI snappy
    // We generate on demand if the specific platform requires it
    setShowShareMenu(true);
  };

  const shareToPlatform = async (platform: string) => {
    const shareText = getShareText();
    const url = window.location.href;
    
    // 2. IMMEDIATE OPEN: For text-based platforms, open immediately to avoid popup blockers.
    // Do NOT await generateImage() here for Twitter/FB/WA/LinkedIn.
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`, '_blank');
        setShowShareMenu(false);
        return; // Exit early
      
      case 'x':
      case 'twitter':
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
        setShowShareMenu(false);
        return;
      
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
        setShowShareMenu(false);
        return;
      
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        setShowShareMenu(false);
        return;
    }

    // 3. ASYNC SHARE: For platforms that need the image (Native, Instagram, Copy)
    setIsGenerating(true); // Optional: show a spinner if this takes long
    const imageUrl = await generateImage();
    setIsGenerating(false);

    switch (platform) {
      case 'instagram':
        if (imageUrl) {
          try {
            const blob = await fetch(imageUrl).then(r => r.blob());
            // Using clipboard API which is supported in most modern browsers
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('Image copied! Open Instagram Stories and paste it. Text copied to clipboard.');
            await navigator.clipboard.writeText(shareText + " " + url);
          } catch (err) {
            console.error('Failed to copy image:', err);
            await navigator.clipboard.writeText(shareText + " " + url);
            alert('Could not copy image automatically. Text copied!');
          }
        }
        break;
      
      case 'native':
        if (navigator.share && imageUrl) {
          try {
            const blob = await fetch(imageUrl).then(r => r.blob());
            const file = new File([blob], `github-wrap-${data.user.login}.png`, { type: 'image/png' });
            
            const shareData = {
                title: `My 2025 GitHub Wrap`,
                text: shareText,
                url: url, // Some apps ignore this if files are present
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                ...shareData,
                files: [file],
              });
            } else {
              // Fallback for devices that support share but not files
              await navigator.share(shareData);
            }
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Share failed:', err);
            }
          }
        }
        break;
      
      case 'copy':
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
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
    { id: 'instagram', name: 'Stories', icon: Instagram, color: '#E4405F' },
    ...(typeof navigator !== 'undefined' && 'share' in navigator ? [{ id: 'native', name: 'Share...', icon: Share2, color: '#7C7CFF' }] : []),
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-accentDefault/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accentJS/10 rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col min-h-0">
             <div className="flex items-center gap-4 mb-6">
                {/* USE THE SAFE AVATAR URL HERE */}
                <img 
                  src={safeAvatarUrl} 
                  alt={data.user.login}
                  className="w-16 h-16 rounded-full border border-white/20"
                  // Removing crossOrigin here as we are now using a data URI which is safe
                />
                <div>
                  <h3 className="text-xl font-bold font-display">@{data.user.login}</h3>
                  <p className="text-sm text-textSecondary">2025 GitHub Wrap</p>
                </div>
             </div>

             <div className="space-y-6">
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
                    <div className="flex gap-1 h-3 mt-2">
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const currentYearContributions = data.contributions.contributions.filter(day => {
                          const dayDate = new Date(day.date);
                          dayDate.setHours(0, 0, 0, 0);
                          return dayDate <= today && dayDate.getFullYear() === today.getFullYear();
                        });
                        
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
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setShowShareMenu(false)}
                   className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                 />
                 
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95, y: 20 }}
                   className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                 >
                   <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-md w-full pointer-events-auto shadow-2xl">
                     <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-bold">Share your Wrap</h3>
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
                             disabled={isGenerating && (platform.id === 'instagram' || platform.id === 'native')}
                             className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group disabled:opacity-50"
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
                     <p className="text-xs text-center mt-6 text-white/30">
                        Web sharing does not support attaching images directly to X/WhatsApp. 
                        We recommend Native Share on mobile.
                     </p>
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