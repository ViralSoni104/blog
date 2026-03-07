"use client";
import { Footer } from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import LinesBGContainer, { ContainerMain } from "@/components/ui/container";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LinesBGContainer className="relative min-h-screen">
      <Navbar />
      <ContainerMain className="h-full w-full bg-background border-x-1 border-foreground/20 border-dashed pt-15 pb-10 max-w-[95vw] lg:max-w-[75vw]">
        {children}
      </ContainerMain>
      <ContainerMain className="w-full bg-background md:border-x-1 border-foreground/20 border-t-1 border-dashed max-w-[100vw] lg:max-w-[75vw]">
        <Footer />
      </ContainerMain>
    </LinesBGContainer>
  );
}
