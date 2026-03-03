import { prisma } from "@/shared/lib/prisma";
import { PackageCard } from "./package-card";

interface RelatedPackagesProps {
  categoryId: string;
  currentPackageId: string;
}

export async function RelatedPackages({
  categoryId,
  currentPackageId,
}: RelatedPackagesProps): Promise<React.ReactElement | null> {
  const related = await prisma.examPackage.findMany({
    where: {
      status: "PUBLISHED",
      categoryId,
      id: { not: currentPackageId },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { attempts: true } },
    },
  });

  if (related.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">
        Paket Lainnya
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((pkg) => (
          <PackageCard
            key={pkg.id}
            slug={pkg.slug}
            title={pkg.title}
            description={pkg.description}
            price={pkg.price}
            discountPrice={pkg.discountPrice}
            isFree={pkg.isFree}
            totalQuestions={pkg.totalQuestions}
            durationMinutes={pkg.durationMinutes}
            participantCount={pkg._count.attempts}
            categoryName={pkg.category.name}
            categorySlug={pkg.category.slug}
          />
        ))}
      </div>
    </section>
  );
}
