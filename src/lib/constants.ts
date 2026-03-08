import {
  IconBrandGithub as GithubIcon,
  IconBrandGithubFilled,
  IconBrandGoogleFilled,
  IconBrandInstagram as InstagramIcon,
  IconBrandX as TwitterIcon,
  IconBrandYoutube as YoutubeIcon,
  IconUsersGroup,
  IconTool,
  IconServer,
} from "@tabler/icons-react";

export const PILLARS = [
  {
    icon: IconTool,
    className: "size-6 text-primary",
    title: "Code & Logic",
    description:
      "Breaking down complex UI components, algorithmic thinking, and the 'aha' moments of untangling messy code.",
  },
  {
    icon: IconServer,
    className: "size-6 text-destructive",
    title: "Modern Web Ecosystem",
    description:
      "Exploring React, Next.js, modern CSS, and the ever-evolving landscape of frontend architecture.",
  },
  {
    icon: IconUsersGroup,
    className: "size-6 text-blue-500",
    title: "The Builder's Journey",
    description:
      "Navigating tutorial hell, imposter syndrome, building side projects, and learning to think like a developer.",
  },
];

export const navItems = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Articles",
    link: "/articles",
  },
  {
    name: "Category",
    link: "/category",
  },
  {
    name: "About",
    link: "/about",
  },
  {
    name: "Contact",
    link: "/contact",
  },
];

{
  /** In Auth Card Set xl:grid-cols-2 for github as well */
}
export const socialMediaButtons = [
  // {
  //   icon: IconBrandGithubFilled,
  //   label: "Continue with Github",
  //   type: "Github",
  // },
  {
    icon: IconBrandGoogleFilled,
    label: "Continue with Google",
    type: "Google",
  },
];

export const socialLinks = [
  {
    name: "Youtube",
    color: "hover:text-red-600",
    icon: YoutubeIcon,
    link: "https://www.youtube.com/@GrafikCreatives",
  },
  {
    name: "Instagram",
    color: "hover:text-pink-600",
    icon: InstagramIcon,
    link: "https://www.instagram.com/grafikcreatives/",
  },
  {
    name: "Twitter/X",
    color: "hover:text-blue-400",
    icon: TwitterIcon,
    link: "https://x.com/GrafikCreatives",
  },
  {
    name: "Github",
    color: "hover:text-primary",
    icon: GithubIcon,
    link: "https://github.com/ViralSoni104",
  },
];

export const emailContact = "sviral572@gmail.com";
