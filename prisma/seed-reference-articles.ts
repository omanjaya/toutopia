import "dotenv/config";
import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { marked } from "marked";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const admin = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
  });

  if (!admin) {
    console.log("No admin user found. Run main seed first.");
    return;
  }

  const now = new Date();
  const refDir = path.resolve(__dirname, "../docs/assets/referensi");

  const articles = [
    {
      file: "KISI-KISI-UTBK-SNBT-2026.md",
      slug: "kisi-kisi-lengkap-utbk-snbt-2026",
      title: "Kisi-Kisi Lengkap UTBK-SNBT 2026",
      category: "Jadwal Ujian",
      tags: ["utbk", "snbt", "kisi-kisi", "2026"],
    },
    {
      file: "MATERI-TES-UTBK-SNBT-2026-RESMI.md",
      slug: "materi-tes-utbk-snbt-2026-resmi",
      title: "Materi Tes UTBK-SNBT 2026 Resmi",
      category: "Jadwal Ujian",
      tags: ["utbk", "snbt", "materi", "2026"],
    },
    {
      file: "PASSING-GRADE-CPNS-2024.md",
      slug: "passing-grade-skd-cpns-2024",
      title: "Passing Grade SKD CPNS 2024",
      category: "Strategi",
      tags: ["cpns", "skd", "passing-grade"],
    },
    {
      file: "STRUKTUR-TES-BUMN-2025.md",
      slug: "struktur-tes-rekrutmen-bumn-2025",
      title: "Struktur Tes Rekrutmen BUMN 2025",
      category: "Strategi",
      tags: ["bumn", "rekrutmen", "tes"],
    },
    {
      file: "SELEKSI-KEDINASAN-2026.md",
      slug: "seleksi-sekolah-kedinasan-2026",
      title: "Seleksi Sekolah Kedinasan 2026",
      category: "Jadwal Ujian",
      tags: ["kedinasan", "seleksi", "2026"],
    },
    {
      file: "STRUKTUR-TES-PPPK.md",
      slug: "struktur-tes-pppk",
      title: "Struktur Tes PPPK",
      category: "Strategi",
      tags: ["pppk", "tes", "asn"],
    },
    {
      file: "INSIGHT-FORUM-KOMUNITAS.md",
      slug: "tips-dari-pengalaman-peserta",
      title: "Tips dari Pengalaman Peserta",
      category: "Tips Belajar",
      tags: ["tips", "pengalaman", "komunitas"],
    },
  ];

  for (const article of articles) {
    const mdContent = fs.readFileSync(path.join(refDir, article.file), "utf-8");
    const htmlContent = await marked(mdContent);
    const plainText = mdContent
      .replace(/[#*_\[\]()>`~|\\-]/g, "")
      .replace(/\n+/g, " ")
      .trim();
    const excerpt =
      plainText.length > 200 ? plainText.slice(0, 200) + "..." : plainText;

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: htmlContent,
        excerpt,
        category: article.category,
        tags: article.tags,
      },
      create: {
        authorId: admin.id,
        title: article.title,
        slug: article.slug,
        content: htmlContent,
        excerpt,
        category: article.category,
        tags: article.tags,
        status: "PUBLISHED",
        publishedAt: now,
        aiGenerated: false,
      },
    });

    console.log(`Seeded: ${article.title}`);
  }

  console.log(`\nSeeded ${articles.length} reference articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
