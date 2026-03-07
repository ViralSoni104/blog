import { cubicBezier } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import type { MotionProps } from "framer-motion";

export const themeIconEnter = {
  light: {
    initial: { rotate: 90, scale: 0.6, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: -90, scale: 0.6, opacity: 0 },
  },
  dark: {
    initial: { rotate: -90, scale: 0.6, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 90, scale: 0.6, opacity: 0 },
  },
};

export const expandWidth: Variants = {
  initial: { width: 0 },
  animate: {
    width: "100%",
    transition: {
      delay: 0.8,
      duration: 1,
      ease: [0.65, 0, 0.35, 1], // "Soulful" ease-in-out
    },
  },
};

export const themeIconTransition: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

export const reducedThemeIcon = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInOnView: MotionProps = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: {
    once: false,
    amount: 0.5,
  },
  transition: {
    duration: 0.8,
  },
};

export const fadeUp: MotionProps = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: {
    duration: 0.2,
    ease: [0.21, 0.45, 0.32, 0.9],
  },
};

export const expandXOnView: MotionProps = {
  initial: { scaleX: 0 },
  whileInView: { scaleX: 1 },
  viewport: {
    once: false,
  },
  transition: {
    duration: 1,
    delay: 0.2,
  },
};

export const slideInRightOnView = (delay = 0): MotionProps => ({
  initial: { opacity: 0, x: 10 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false },
  transition: {
    duration: 0.3,
    delay,
  },
});

export const slideInLeft: MotionProps = {
  initial: { opacity: 0, x: -10 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false },
  transition: {
    duration: 0.5,
    ease: cubicBezier(0.21, 0.45, 0.32, 0.9),
  },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1) },
  },
};

export const pulseGlow: MotionProps = {
  animate: {
    opacity: [0.03, 0.15, 0.03],
    scale: [0.95, 1.05, 0.95],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const pulseOpacity: MotionProps = {
  animate: {
    opacity: [0.2, 0.6, 0.2],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const letterSpacingReveal: MotionProps = {
  initial: {
    letterSpacing: "0.2em",
    opacity: 0,
  },
  whileInView: {
    letterSpacing: "0.4em",
    opacity: 1,
  },
  viewport: {
    once: false,
    amount: 0.4,
  },
  transition: {
    duration: 1.2,
    delay: 0.4,
    ease: "easeOut",
  },
};
