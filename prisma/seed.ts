import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "argon2";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create super admin
  const adminPassword = await hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@toutopia.id" },
    update: {},
    create: {
      email: "admin@toutopia.id",
      name: "Super Admin",
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      credits: {
        create: {
          balance: 0,
          freeCredits: 0,
        },
      },
    },
  });
  console.log(`  Admin created: ${admin.email}`);

  // Create exam categories
  const categories = [
    {
      name: "UTBK-SNBT",
      slug: "utbk-snbt",
      description:
        "Seleksi Nasional Berdasarkan Tes untuk masuk perguruan tinggi negeri",
      icon: "GraduationCap",
      order: 1,
      subCategories: [
        {
          name: "TPS",
          slug: "tps",
          order: 1,
          subjects: [
            {
              name: "Penalaran Umum",
              slug: "penalaran-umum",
              order: 1,
              topics: [
                "Penalaran Analitik",
                "Penalaran Deduktif",
                "Penalaran Induktif",
              ],
            },
            {
              name: "Pengetahuan Kuantitatif",
              slug: "pengetahuan-kuantitatif",
              order: 2,
              topics: ["Aritmatika", "Aljabar", "Geometri", "Statistika"],
            },
            {
              name: "Penalaran Matematika",
              slug: "penalaran-matematika",
              order: 3,
              topics: [
                "Logika Matematika",
                "Barisan dan Deret",
                "Peluang",
                "Fungsi",
              ],
            },
            {
              name: "Literasi Bahasa Indonesia",
              slug: "literasi-bahasa-indonesia",
              order: 4,
              topics: [
                "Pemahaman Bacaan",
                "Kalimat Efektif",
                "Gagasan Pokok",
                "Simpulan",
              ],
            },
            {
              name: "Literasi Bahasa Inggris",
              slug: "literasi-bahasa-inggris",
              order: 5,
              topics: [
                "Reading Comprehension",
                "Vocabulary",
                "Grammar",
                "Inference",
              ],
            },
          ],
        },
        {
          name: "TKA Saintek",
          slug: "tka-saintek",
          order: 2,
          subjects: [
            {
              name: "Matematika",
              slug: "matematika-saintek",
              order: 1,
              topics: [
                "Kalkulus",
                "Trigonometri",
                "Vektor",
                "Matriks",
                "Integral",
              ],
            },
            {
              name: "Fisika",
              slug: "fisika",
              order: 2,
              topics: [
                "Mekanika",
                "Termodinamika",
                "Gelombang",
                "Listrik",
                "Optik",
              ],
            },
            {
              name: "Kimia",
              slug: "kimia",
              order: 3,
              topics: [
                "Stoikiometri",
                "Termokimia",
                "Kesetimbangan",
                "Elektrokimia",
                "Kimia Organik",
              ],
            },
            {
              name: "Biologi",
              slug: "biologi",
              order: 4,
              topics: ["Sel", "Genetika", "Evolusi", "Ekologi", "Fisiologi"],
            },
          ],
        },
        {
          name: "TKA Soshum",
          slug: "tka-soshum",
          order: 3,
          subjects: [
            {
              name: "Sosiologi",
              slug: "sosiologi",
              order: 1,
              topics: [
                "Interaksi Sosial",
                "Stratifikasi",
                "Perubahan Sosial",
              ],
            },
            {
              name: "Sejarah",
              slug: "sejarah",
              order: 2,
              topics: [
                "Sejarah Indonesia",
                "Sejarah Dunia",
                "Historiografi",
              ],
            },
            {
              name: "Ekonomi",
              slug: "ekonomi",
              order: 3,
              topics: [
                "Mikro Ekonomi",
                "Makro Ekonomi",
                "Akuntansi",
                "Perdagangan",
              ],
            },
            {
              name: "Geografi",
              slug: "geografi",
              order: 4,
              topics: [
                "Geografi Fisik",
                "Geografi Manusia",
                "Kartografi",
                "SIG",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "CPNS",
      slug: "cpns",
      description: "Tes seleksi Calon Pegawai Negeri Sipil",
      icon: "Landmark",
      order: 2,
      subCategories: [
        {
          name: "SKD",
          slug: "skd",
          order: 1,
          subjects: [
            {
              name: "TWK",
              slug: "twk",
              order: 1,
              topics: [
                "Pancasila",
                "UUD 1945",
                "NKRI",
                "Bhinneka Tunggal Ika",
                "Pilar Negara",
              ],
            },
            {
              name: "TIU",
              slug: "tiu",
              order: 2,
              topics: [
                "Verbal",
                "Numerik",
                "Figural",
                "Analitik",
                "Logika",
              ],
            },
            {
              name: "TKP",
              slug: "tkp",
              order: 3,
              topics: [
                "Pelayanan Publik",
                "Jejaring Kerja",
                "Sosial Budaya",
                "TIK",
                "Profesionalisme",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "BUMN",
      slug: "bumn",
      description: "Tes Rekrutmen Bersama BUMN",
      icon: "Building2",
      order: 3,
      subCategories: [
        {
          name: "TKD BUMN",
          slug: "tkd-bumn",
          order: 1,
          subjects: [
            {
              name: "Tes Kemampuan Dasar",
              slug: "tkd",
              order: 1,
              topics: ["Verbal", "Numerikal", "Figural", "Logika"],
            },
            {
              name: "Core Values BUMN",
              slug: "core-values",
              order: 2,
              topics: [
                "AKHLAK",
                "Amanah",
                "Kompeten",
                "Harmonis",
                "Loyal",
                "Adaptif",
                "Kolaboratif",
              ],
            },
            {
              name: "English",
              slug: "english-bumn",
              order: 3,
              topics: [
                "Reading",
                "Grammar",
                "Vocabulary",
                "Business English",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Kedinasan",
      slug: "kedinasan",
      description: "Tes masuk sekolah kedinasan (STAN, STIS, IPDN, dll)",
      icon: "Shield",
      order: 4,
      subCategories: [
        {
          name: "PKN STAN",
          slug: "pkn-stan",
          order: 1,
          subjects: [
            {
              name: "TPA",
              slug: "tpa-stan",
              order: 1,
              topics: ["Verbal", "Numerik", "Figural"],
            },
            {
              name: "TBI",
              slug: "tbi-stan",
              order: 2,
              topics: [
                "Structure",
                "Written Expression",
                "Reading Comprehension",
              ],
            },
          ],
        },
        {
          name: "STIS",
          slug: "stis",
          order: 2,
          subjects: [
            {
              name: "Matematika STIS",
              slug: "matematika-stis",
              order: 1,
              topics: [
                "Aljabar",
                "Kalkulus",
                "Statistika",
                "Logika Matematika",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "PPPK",
      slug: "pppk",
      description: "Tes Pegawai Pemerintah dengan Perjanjian Kerja",
      icon: "FileCheck",
      order: 5,
      subCategories: [
        {
          name: "Kompetensi PPPK",
          slug: "kompetensi-pppk",
          order: 1,
          subjects: [
            {
              name: "Kompetensi Teknis",
              slug: "kompetensi-teknis",
              order: 1,
              topics: ["Pengetahuan Bidang", "Keterampilan Teknis"],
            },
            {
              name: "Kompetensi Manajerial",
              slug: "kompetensi-manajerial",
              order: 2,
              topics: [
                "Integritas",
                "Kerjasama",
                "Komunikasi",
                "Pengambilan Keputusan",
              ],
            },
            {
              name: "Kompetensi Sosio-Kultural",
              slug: "kompetensi-sosio-kultural",
              order: 3,
              topics: ["Perekat Bangsa", "Keragaman Budaya"],
            },
          ],
        },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await prisma.examCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
      },
    });
    console.log(`  Category: ${category.name}`);

    for (const sub of cat.subCategories) {
      const subCategory = await prisma.examSubCategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: sub.slug,
          },
        },
        update: { name: sub.name, order: sub.order },
        create: {
          categoryId: category.id,
          name: sub.name,
          slug: sub.slug,
          order: sub.order,
        },
      });
      console.log(`    Sub: ${subCategory.name}`);

      for (const subj of sub.subjects) {
        const subject = await prisma.subject.upsert({
          where: {
            subCategoryId_slug: {
              subCategoryId: subCategory.id,
              slug: subj.slug,
            },
          },
          update: { name: subj.name, order: subj.order },
          create: {
            subCategoryId: subCategory.id,
            name: subj.name,
            slug: subj.slug,
            order: subj.order,
          },
        });

        for (let i = 0; i < subj.topics.length; i++) {
          const topicName = subj.topics[i];
          const topicSlug = topicName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_]+/g, "-");

          await prisma.topic.upsert({
            where: {
              subjectId_slug: {
                subjectId: subject.id,
                slug: topicSlug,
              },
            },
            update: { name: topicName, order: i + 1 },
            create: {
              subjectId: subject.id,
              name: topicName,
              slug: topicSlug,
              order: i + 1,
            },
          });
        }
        console.log(`      Subject: ${subject.name} (${subj.topics.length} topics)`);
      }
    }
  }

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
