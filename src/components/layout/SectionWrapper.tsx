import type { ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import clsx from "clsx";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const SectionWrapper = ({ children, className, id }: SectionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <section 
      id={id}
      ref={ref} 
      className={clsx(
        "min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4 md:px-12 py-20 snap-start",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-6xl z-10"
      >
        {children}
      </motion.div>
    </section>
  );
};
