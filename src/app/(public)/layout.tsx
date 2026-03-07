import "@/styles/globals.css";
import Layout from "@/components/layout/site-layout";
import { Toaster } from "sonner";
import { PostHogProvider } from "@/components/provider/posthog-provider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PostHogProvider>
      <Toaster closeButton />
      <Layout>{children}</Layout>
    </PostHogProvider>
  );
}
