import { AnimatePresence, motion } from "motion/react";

type TextRotateProps = {
  texts: string[];
  currentIndex: number;
};

export function TextRotate({
  texts,
  currentIndex,
}: TextRotateProps) {
  const text = texts[currentIndex] || texts[0];

  return (
    <span className="relative inline-flex overflow-hidden rounded-[14px] bg-[#12b8d6] px-4 py-1.5 text-white sm:px-5 sm:py-2">
      <span className="invisible">{text}</span>

      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-120%", opacity: 0 }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 400,
          }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
