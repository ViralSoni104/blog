import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Create a new Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Create the ratelimiter: 3 requests per 1 minute
export const signupLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "ratelimit:signup",
});

export const loginLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:login",
});

export const twoFALimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, "5 m"),
  analytics: true,
  prefix: "ratelimit:2fa-resend",
});

// Password Reset: Very strict to prevent email flooding
export const resetPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "5 m"),
  prefix: "ratelimit:password-reset",
});

export const updatePasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"), // 3 attempts every 15 mins per IP
  prefix: "ratelimit:update-password",
});
// Contact Form: Prevents inbox spam
export const contactLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1 m"),
  prefix: "ratelimit:contact",
});

// Verification: Standard protection
export const verificationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "ratelimit:verify",
});

export const subscribeLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "5 m"),
  analytics: true,
  prefix: "ratelimit:subscribe-newsletter",
});

// export const postLimiter = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(2, "1 m"),
//   analytics: true,
//   prefix: "ratelimit:post-limiter",
// });

export const commentLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:comment-limiter",
});

export const reportLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"), // 0 3per hour
  analytics: true,
  prefix: "ratelimit:report-limiter",
});

// export const ipLimiter = new Ratelimit({
//   redis: redis,
//   limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 shares per 10 mins per IP
//   prefix: "ratelimit:ip",
// });

// For general social interactions (Like/Bookmark)
export const interactionLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 actions per minute
  prefix: "ratelimit:interaction",
});
