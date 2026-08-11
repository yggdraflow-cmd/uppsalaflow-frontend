import {
  type ReactNode,
  useRef,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type TextBlockAnimationProps = {
  children: ReactNode;
  blockColor?: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  animateOnScroll?: boolean;
  className?: string;
};

export default function TextBlockAnimation({
  children,
  blockColor = "#12b8d6",
  duration = 0.8,
  delay = 0,
  animateOnScroll = true,
  className = "",
}: TextBlockAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const content = contentRef.current;
      const block = blockRef.current;

      if (!container || !content || !block) {
        return;
      }

      gsap.set(content, {
        opacity: 0,
      });

      gsap.set(block, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      const timeline = gsap.timeline({
        paused: animateOnScroll,
        delay,
      });

      timeline
        .to(block, {
          scaleX: 1,
          duration: duration * 0.5,
          ease: "power3.inOut",
        })
        .set(content, {
          opacity: 1,
        })
        .set(block, {
          transformOrigin: "right center",
        })
        .to(block, {
          scaleX: 0,
          duration: duration * 0.5,
          ease: "power3.inOut",
        });

      if (!animateOnScroll) {
        timeline.play();
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: "top 82%",
        once: true,
        onEnter: () => timeline.play(),
      });

      return () => {
        trigger.kill();
        timeline.kill();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        animateOnScroll,
        blockColor,
        delay,
        duration,
      ],
    }
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <div ref={contentRef}>
        {children}
      </div>

      <div
        ref={blockRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundColor: blockColor,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
