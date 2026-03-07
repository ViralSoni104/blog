import * as z from "zod";
import { Category, Prisma } from "@/generated/prisma/client";

export type NewsletterSubscribeData = z.infer<typeof NewsletterSubscribeSchema>;
export const NewsletterSubscribeSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
  fax: z.string().optional(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
export const ContactFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.email({ message: "Please enter a valid email address." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
  fax: z.string().optional(),
});

export const SettingsSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters." })
      .optional(),
    image: z.optional(z.string()),
    isTwoFactorEnabled: z.boolean().optional(),
    password: z
      .string()
      .min(8, { message: "Minimum 8 characters required" })
      .optional()
      .or(z.literal("")),
    newPassword: z
      .string()
      .min(8, { message: "Minimum 8 characters required" })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) return false;
      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) return false;
      return true;
    },
    {
      message: "Current password is required!",
      path: ["password"],
    },
  );

export const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// export interface ActionResponse<T = any> {
//   success: boolean;
//   message: string;
//   errors?: {
//     [K in keyof T]?: string[];
//   };
//   inputs?: T;
// }

export type loginData = z.infer<typeof LoginSchema>;
export const loginFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email" }),
  password: z
    .string({ error: "Password is required" })
    .min(1, { error: "Password is required" }),
  "social-media-buttons": z.unknown(),
  code: z.string().optional(),
  twoFactorStep: z.boolean().optional(),
});

export type signupData = z.infer<typeof signupFormSchema>;
export const signupFormSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .min(1, { error: "Name is required" }),
    email: z.email({ error: "Please enter a valid email" }),
    password: z
      .string({ error: "Password is required" })
      .min(8, { error: "Minimum 8 characters required" }),
    "confirm-password": z
      .string({ error: "Confirm Password is required" })
      .min(1, { error: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data["confirm-password"], {
    message: "Passwords do not match",
    path: ["confirm-password"], // Soul: Attaches the error specifically to this field
  });

export const verificationEmailSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export const resetSchema = z.object({
  email: z.email({
    message: "Email is required",
  }),
});

// You'll also need this for the next step:
export const newPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Minimum of 8 characters required",
  }),
});

export type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    categories: true;
    author: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen separated"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(10, "Content is required"),
  image: z.string().nullable().optional(),
  published: z.boolean(),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export type PostInput = z.infer<typeof postSchema>;

export interface UserWithAccounts {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  isTwoFactorEnabled: boolean;
  // 💡 Match the nested structure exactly
  accounts: {
    provider: string;
  }[];
}

export type CategoryWithCount = Category & {
  _count: {
    posts: number;
  };
};

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Name must be at least 1 characters" }),

  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must contain only lowercase letters, numbers and hyphens",
    }),

  description: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .min(2, "Comment must be at least 2 characters.")
    .max(5000, "Comment is too long."),
  parentId: z.string().nullable().optional(),
  postId: z.string(),
});

export const updateCommentSchema = z.object({
  commentId: z.string().min(1, "Invalid comment!"),
  content: z.string().min(2).max(5000, "Comment is too long."),
});

export const reportCommentSchema = z.object({
  commentId: z.string().min(1, "Invalid comment!"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(300, "Reason is too long."),
});

export type ReportCommentInput = z.infer<typeof reportCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
