import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { cacheTag, cacheLife } from "next/cache";

type UserWithAccounts = Prisma.UserGetPayload<{
  include: {
    accounts: {
      select: {
        provider: true;
      };
    };
  };
}>;

export const getPaginatedUsers = async (
  page: number,
  limit: number,
  search?: string,
): Promise<{
  data: UserWithAccounts[]; // Explicitly define the return type
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  "use cache";
  // Tag it so we can revalidate when a user is deleted or edited
  cacheTag("admin-users");
  cacheLife("minutes");

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const trimmedSearch = search?.trim();

  const where = trimmedSearch
    ? {
        OR: [
          {
            name: {
              contains: trimmedSearch,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: trimmedSearch,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : undefined;

  const [data, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    data: data as UserWithAccounts[],
    total,
    totalPages: Math.ceil(total / safeLimit),
    currentPage: safePage,
  };
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};
