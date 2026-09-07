import { useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "react-router-dom";

import { TextRotate } from "./TextRotate";

export function PageTransition() {
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useLayoutEffect(() => {
    const shouldShowTransition =
      location.state?.showLoginTransition === true;

    if (!shouldShowTransition) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setWordIndex(0);

    const wordTimer = window.setTimeout(() => {
      setWordIndex(1);
    }, 1100);

    const finishTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 2400);

    return () => {
      window.clearTimeout(wordTimer);
      window.clearTimeout(finishTimer);
    };
  }, [location.key, location.state]);

  return (
    <AnimatePresence mode="wait">
      {isVisible ? (
        <motion.div
          key={`yggdraflow-transition-${location.key}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <div className="flex items-center gap-3 px-6 text-[42px] font-light tracking-[-0.05em] text-[#081120] sm:gap-4 sm:text-[64px] md:text-[78px]">
            <span>Yggdra</span>

            <TextRotate
              texts={["Flow", "All..."]}
              currentIndex={wordIndex}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
