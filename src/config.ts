import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://womendevssg.netlify.app/", // replace this with your deployed domain
  author: "Women Devs SG",
  profile: "",
  desc: "Dedicated to inspiring women to excel in technology careers.",
  title: "Women Devs SG",
  ogImage: "wds-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 3,
  postPerPage: 7,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  editPost: {
    url: "https://github.com/satnaing/astro-paper/edit/main/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: false,
  },
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: true,
  width: 290,
  height: 69,
};

export const SOCIALS: SocialObjects = [
  {
    name: "GitHub",
    href: "https://github.com/Women-Devs-SG",
    linkTitle: ` ${SITE.title} on GitHub`,
    active: true,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/groups/womendevssg",
    linkTitle: `${SITE.title} on Facebook`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/womendevssg/",
    linkTitle: `${SITE.title} on Instagram`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/women-devs-sg/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:yourmail@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
  {
    name: "Twitch",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: false,
  },
  {
    name: "Snapchat",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false,
  },
  {
    name: "Pinterest",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false,
  },
  {
    name: "TikTok",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "CodePen",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: "Discord",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: "Skype",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: "Steam",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: "Telegram",
    href: "https://t.me/+hh3Fts4oDG41NzQ1",
    linkTitle: `${SITE.title} on Telegram`,
    active: true,
  },
  {
    name: "Mastodon",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Mastodon`,
    active: false,
  },
  {
    name: "Meetup",
    href: "https://www.meetup.com/women-devs-sg/",
    linkTitle: `${SITE.title} on Meetup`,
    active: true,
  },
  {
    name: "Website",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `See my portfolio on ${SITE.title}`,
    active: false,
  },
  {
    name: "Figma",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Figma`,
    active: false,
  },
  {
    name: "Behance",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Behance`,
    active: false,
  }
];
