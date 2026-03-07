"use client";

import React, { useState, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  IconUsers,
  IconFileText,
  IconEye,
  IconMessageReport,
  IconTrendingUp,
  IconArrowRight,
  IconRefresh,
  IconChevronDown,
  IconHeart,
  IconBookmark,
  IconShieldCheck,
  IconActivity,
  IconTarget,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DashboardStats } from "@/data/admin-analytics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// 2. Lazily load the chart component
const DashboardChart = dynamic(
  () => import("@/components/ui/dashboard-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-muted rounded-xl" />
    ),
  },
);
interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const nav = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-10 pb-12">
      {/* 1. MINIMAL HEADER */}
      <div className="flex md:items-center justify-between md:flex-row flex-col gap-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            System performance and community engagement.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => nav.refresh())}
          disabled={isPending}
          className="rounded-xl border-muted-foreground/20 shadow-sm px-4"
        >
          <IconRefresh
            size={16}
            className={cn("mr-2", isPending && "animate-spin")}
          />
          Sync
        </Button>
      </div>

      {/* 2. VITAL SIGNS (Always Visible) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<IconUsers size={20} />}
          color="text-blue-500"
        />
        <StatCard
          title="Posts"
          value={stats.totalPosts}
          icon={<IconFileText size={20} />}
          color="text-emerald-500"
        />
        <StatCard
          title="Total Reach"
          value={stats.totalViews}
          icon={<IconEye size={20} />}
          color="text-purple-500"
        />
        <StatCard
          title="Alerts"
          value={stats.pendingReports}
          icon={<IconMessageReport size={20} />}
          color="text-rose-500"
        />
      </div>

      {/* 3. CONTENT PERFORMANCE (Priority #1) */}
      <CollapsibleSection
        title="Content Performance"
        icon={<IconActivity size={18} className="text-blue-500" />}
        defaultOpen
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-muted-foreground/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Top Performing Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-muted-foreground/10 hover:bg-muted/30 transition-colors"
                >
                  <div className="max-w-[65%]">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                      {post.viewCount.toLocaleString()} views
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-rose-500 text-xs font-bold">
                      <IconHeart size={14} /> {post._count.likes}
                    </div>
                    <div className="flex items-center gap-1 text-blue-500 text-xs font-bold">
                      <IconBookmark size={14} /> {post._count.bookmarks}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-muted-foreground/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {stats.categoryStats.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight">
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground">
                      {cat.viewSum.toLocaleString()} views
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${(cat._count.posts / (stats.totalPosts || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </CollapsibleSection>

      {/* 4. GROWTH SECTION (Priority #2) */}
      <CollapsibleSection
        title="Growth & Conversion"
        icon={<IconTrendingUp size={18} className="text-emerald-500" />}
      >
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4 rounded-2xl border-muted-foreground/20 shadow-none overflow-hidden bg-background">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">
                User Growth
              </CardTitle>
              <CardDescription>Monthly registration volume</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <DashboardChart data={stats.chartData} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 rounded-2xl border-muted-foreground/20 bg-amber-500/[0.03] border-amber-500/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-700">
                <IconTarget size={18} /> Conversion (Today)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="flex justify-between items-end border-b border-amber-500/10 pb-4">
                <span className="text-xs font-bold uppercase text-amber-900/40 tracking-wider">
                  New Subs
                </span>
                <span className="text-3xl font-bold text-amber-600">
                  {stats.conversionMetrics.subsToday}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold uppercase text-amber-900/40 tracking-wider">
                  New Signups
                </span>
                <span className="text-3xl font-bold text-amber-600">
                  {stats.conversionMetrics.userToday}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CollapsibleSection>

      {/* 5. COMMUNITY HEALTH */}
      <CollapsibleSection
        title="System Health"
        icon={<IconShieldCheck size={18} className="text-rose-500" />}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-muted-foreground/20 bg-rose-500/[0.02] border-rose-500/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-rose-600 uppercase tracking-wider">
                Community Toxicity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-2">
              <div>
                <div className="text-4xl font-bold text-rose-600">
                  {stats.communityHealth.toxicityRatio.toFixed(2)}%
                </div>
                <p className="text-[10px] font-bold text-rose-600/60 uppercase mt-1">
                  Report frequency
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-rose-900/40">
                  {stats.communityHealth.totalComments}
                </div>
                <p className="text-[10px] font-bold text-rose-600/60 uppercase">
                  Analyzed Comments
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-muted-foreground/20 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Newest Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between group p-1"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-full grayscale border">
                      <AvatarImage
                        src={user.image ?? ""}
                        alt={user.name ?? ""}
                      />
                      <AvatarFallback className="text-[10px] font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[150px]">
                      <p className="text-sm font-semibold truncate leading-none">
                        {user.name || "Anonymous"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/user?search=${user.email}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    >
                      <IconArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/admin/user">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// --- SHARED UI COMPONENTS ---

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const initOpen = defaultOpen;
  const [isOpen, setIsOpen] = useState(initOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <div className="flex items-center justify-between border-b border-muted pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
            {title}
          </h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
          >
            <IconChevronDown
              size={16}
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className="rounded-2xl border-muted-foreground/20 shadow-none transition-colors hover:bg-muted/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
          {title}
        </span>
        <div className={cn("p-1.5 rounded-lg bg-muted/50", color)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
