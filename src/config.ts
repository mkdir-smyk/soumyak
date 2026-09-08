export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  headline: string;
  email: string;
  phone?: string;
  github: string;
  linkedin: string;
  location: string;
  siteUrl: string;
  nav: Array<{ label: string; href: string }>;
}

export const SITE: SiteConfig = {
  title: "Soumyak Pransuman Behera",
  description: "Personal academic and technical homepage of Soumyak Pransuman Behera. Computer Science student, researcher, and builder.",
  author: "Soumyak Pransuman Behera",
  headline: "Computer Science undergraduate and researcher working on machine learning, natural language processing, and systems.",
  email: "behera.soumyak05@gmail.com",
  phone: "+91 98106 64513",
  github: "https://github.com/mkdir-smyk",
  linkedin: "https://linkedin.com/in/soumyak-p-behera",
  location: "Bhopal / New Delhi, India",
  siteUrl: "https://mkdir-smyk.github.io",
  nav: [
    { label: "Home", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Blog", href: "/blog" },
  ],
};
