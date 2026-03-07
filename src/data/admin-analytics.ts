import { db } from "@/lib/db";
import { cacheLife, cacheTag } from "next/cache";

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  activeSubscribers: number;
  pendingReports: number;
  totalViews: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  }[];
  chartData: { date: string; count: number }[];
  topPosts: {
    id: string;
    title: string;
    viewCount: number;
    _count: { likes: number; bookmarks: number };
  }[];
  categoryStats: {
    name: string;
    _count: { posts: number };
    viewSum: number;
  }[];
  communityHealth: {
    toxicityRatio: number;
    totalComments: number;
  };
  conversionMetrics: {
    userToday: number;
    subsToday: number;
  };
}

export const getDashboardAnalytics = async (): Promise<DashboardStats> => {
  "use cache";
  cacheTag("admin-stats");
  cacheLife("hours");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      userCount,
      postCount,
      subscriberCount,
      reports,
      views,
      rawTopPosts, // Renamed to raw to cast it safely
      categories,
      commentCount,
      userToday,
      subsToday,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.post.count(),
      db.subscriber.count({ where: { isActive: true } }),
      db.commentReport.count(),
      db.post.aggregate({ _sum: { viewCount: true } }),
      db.post.findMany({
        take: 5,
        orderBy: { viewCount: "desc" },
        select: {
          id: true,
          title: true,
          viewCount: true,
          _count: { select: { likes: true, bookmarks: true } },
        },
      }),
      db.category.findMany({
        select: {
          name: true,
          _count: { select: { posts: true } },
          posts: { select: { viewCount: true } },
        },
      }),
      db.comment.count(),
      db.user.count({ where: { createdAt: { gte: today } } }),
      db.subscriber.count({ where: { createdAt: { gte: today } } }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, image: true },
      }),
    ]);

    // Force TypeScript to treat rawTopPosts as the specific subset we selected
    const topPosts = rawTopPosts as unknown as DashboardStats["topPosts"];

    const processedCategories = categories
      .map((cat) => ({
        name: cat.name,
        _count: cat._count,
        viewSum: cat.posts.reduce((sum, p) => sum + p.viewCount, 0),
      }))
      .sort((a, b) => b.viewSum - a.viewSum)
      .slice(0, 5);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersForChart = await db.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthMap: Record<string, number> = {};
    usersForChart.forEach((u) => {
      const m = u.createdAt.toLocaleDateString("en-US", { month: "short" });
      monthMap[m] = (monthMap[m] || 0) + 1;
    });

    return {
      totalUsers: userCount || 0,
      totalPosts: postCount || 0,
      activeSubscribers: subscriberCount || 0,
      pendingReports: reports || 0,
      totalViews: views._sum.viewCount || 0,
      chartData: Object.entries(monthMap).map(([date, count]) => ({
        date,
        count,
      })),
      recentUsers: recentUsers || [],
      topPosts: topPosts || [], // Now matches exactly
      categoryStats: processedCategories,
      communityHealth: {
        toxicityRatio: commentCount > 0 ? (reports / commentCount) * 100 : 0,
        totalComments: commentCount,
      },
      conversionMetrics: { userToday, subsToday },
    };
  } catch {
    return {
      totalUsers: 0,
      totalPosts: 0,
      activeSubscribers: 0,
      pendingReports: 0,
      totalViews: 0,
      recentUsers: [],
      chartData: [],
      topPosts: [],
      categoryStats: [],
      communityHealth: { toxicityRatio: 0, totalComments: 0 },
      conversionMetrics: { userToday: 0, subsToday: 0 },
    };
  }
};
