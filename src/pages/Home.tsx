import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Github } from "lucide-react";

export const Home = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Animate out trigger or just navigate
    // Ideally we navigate to /wrap/:username
    // and let that page handle fetching + loading sequence
    navigate(`/wrap/${username}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
      {/* Background blobs for cinematic feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accentDefault/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accentPython/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl text-center z-10"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <Github size={40} className="text-white" />
          </div>
        </motion.div>

        <h1 className="font-display font-bold text-6xl md:text-8xl tracking-tight mb-6 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
          GitHub Wrap
        </h1>
        
        <p className="font-body text-textSecondary text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
          Your coding year, visualized. No login required.
          <br /> Just enter your username.
        </p>

        <form onSubmit={handleSubmit} className="relative max-w-md mx-auto group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="github_username"
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-8 text-xl font-body text-white placeholder:text-white/20 focus:outline-none focus:border-accentDefault/50 focus:ring-1 focus:ring-accentDefault/50 transition-all text-center"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!username}
            className="mt-6 w-full bg-white text-black font-bold py-4 rounded-full text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            Wrap My Year
          </motion.button>
        </form>
      </motion.div>
      
      <footer className="absolute bottom-8 text-center text-white/20 text-sm font-body">
        Built with React, Framer Motion & GitHub API
      </footer>
    </div>
  );
};
