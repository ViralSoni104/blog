import type { Metadata } from "next";
import About from "@/components/sections/about-section";
import { site } from "@/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Documenting the journey of modern web development, code logic, and the human side of software engineering.",
  openGraph: {
    title: `About · ${site.name}`,
    description:
      "Documenting the journey of modern web development, code logic, and the human side of software engineering.",
    url: `${site.url}/about`,
  },
};

export default function AboutPage() {
  return <About />;
}
