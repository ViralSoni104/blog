import type { Metadata } from "next";
import Contact from "@/components/sections/contact-section";
import { site } from "@/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach out to discuss web development, collaboration, or just to say hello.",
  openGraph: {
    title: `Contact · ${site.name}`,
    description:
      "Reach out to discuss web development, collaboration, or just to say hello.",
    url: `${site.url}/contact`,
  },
};

export default function ContactPage() {
  return <Contact />;
}
