import { site } from "@/site";
const SITE_URL = site.url;

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Logic & Soul",
  url: SITE_URL,
  description:
    "Refactoring real-world failures into programmable wisdom. Where logic meets the human experience.",
  publisher: {
    "@type": "Person",
    name: "VR Soni",
  },
};
