import { MetadataRoute } from "next";
import { prisma } from "@/shared/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${BASE_URL}/pricing`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/packages`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/leaderboard`, changeFrequency: "hourly", priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/tryout-utbk`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/tryout-cpns`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/tryout-bumn`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/tryout-kedinasan`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/tryout-pppk`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.4, lastModified: now },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.4, lastModified: now },
  ];

  // Blog articles
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Exam packages
  const packages = await prisma.examPackage.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const packagePages: MetadataRoute.Sitemap = packages.map((pkg) => ({
    url: `${BASE_URL}/packages/${pkg.slug}`,
    lastModified: pkg.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages, ...packagePages];
}
