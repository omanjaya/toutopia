import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, notFoundResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const updateBundleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  monthlyPrice: z.number().int().positive().optional(),
  quarterlyPrice: z.number().int().positive().optional().nullable(),
  yearlyPrice: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  packageIds: z.array(z.string()).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bundle = await prisma.subscriptionBundle.findUnique({
      where: { id },
      include: {
        packages: { select: { id: true, title: true, status: true } },
        _count: { select: { subscriptions: true } },
      },
    });
    if (!bundle) return notFoundResponse("Bundle");
    return successResponse(bundle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updateBundleSchema.parse(body);

    const bundle = await prisma.$transaction(async (tx) => {
      if (data.packageIds !== undefined) {
        // Unlink old packages from this bundle
        await tx.examPackage.updateMany({ where: { bundleId: id }, data: { bundleId: null } });
        // Link new packages
        if (data.packageIds.length > 0) {
          await tx.examPackage.updateMany({ where: { id: { in: data.packageIds } }, data: { bundleId: id } });
        }
      }
      return tx.subscriptionBundle.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.monthlyPrice !== undefined && { monthlyPrice: data.monthlyPrice }),
          ...(data.quarterlyPrice !== undefined && { quarterlyPrice: data.quarterlyPrice }),
          ...(data.yearlyPrice !== undefined && { yearlyPrice: data.yearlyPrice }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: { packages: { select: { id: true, title: true } }, _count: { select: { subscriptions: true } } },
      });
    });
    return successResponse(bundle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bundle = await prisma.subscriptionBundle.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    });
    if (!bundle) return notFoundResponse("Bundle");
    // Unlink packages first
    await prisma.examPackage.updateMany({ where: { bundleId: id }, data: { bundleId: null } });
    await prisma.subscriptionBundle.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
