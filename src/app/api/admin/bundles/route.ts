import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { z } from "zod";

const createBundleSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    monthlyPrice: z.number().int().positive(),
    quarterlyPrice: z.number().int().positive().optional(),
    yearlyPrice: z.number().int().positive().optional(),
    packageIds: z.array(z.string()).optional(),
});

// GET: List all bundles
export async function GET(request: NextRequest): Promise<Response> {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") ?? "1", 10);
        const limit = parseInt(searchParams.get("limit") ?? "10", 10);

        const [bundles, total] = await Promise.all([
            prisma.subscriptionBundle.findMany({
                include: {
                    packages: { select: { id: true, title: true } },
                    _count: { select: { subscriptions: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.subscriptionBundle.count(),
        ]);

        return successResponse(bundles, { page, limit, total });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Create bundle
export async function POST(request: NextRequest): Promise<Response> {
    try {
        await requireAdmin();
        const body = await request.json();
        const data = createBundleSchema.parse(body);

        // Check slug uniqueness
        const existing = await prisma.subscriptionBundle.findUnique({ where: { slug: data.slug } });
        if (existing) {
            return errorResponse("SLUG_EXISTS", "Slug sudah digunakan", 400);
        }

        const bundle = await prisma.subscriptionBundle.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                categoryId: data.categoryId,
                monthlyPrice: data.monthlyPrice,
                quarterlyPrice: data.quarterlyPrice,
                yearlyPrice: data.yearlyPrice,
            },
        });

        // Link packages if provided
        if (data.packageIds && data.packageIds.length > 0) {
            await prisma.examPackage.updateMany({
                where: { id: { in: data.packageIds } },
                data: { bundleId: bundle.id },
            });
        }

        return successResponse(bundle, undefined, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
