import { useEffect } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    // lenis.on("scroll", (e) => {
    //   console.log(e);
    // });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-backgroundDark text-textPrimaryDark selection:bg-accentDefault selection:text-white">
       {/* Background noise or subtle gradient can go here */}
      <div className="fixed inset-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay z-50"></div>
      
      <main className="relative w-full">
        {children}
      </main>
    </div>
  );
};
