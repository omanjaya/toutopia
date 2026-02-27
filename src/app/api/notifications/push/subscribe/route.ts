import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = subscribeSchema.parse(body);

    // Prevent hijacking: check if endpoint belongs to a different user
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: data.endpoint },
    });

    if (existing && existing.userId !== user.id) {
      return errorResponse("ENDPOINT_CONFLICT", "Subscription endpoint already in use", 409);
    }

    const subscription = existing
      ? await prisma.pushSubscription.update({
          where: { endpoint: data.endpoint },
          data: {
            p256dh: data.keys.p256dh,
            auth: data.keys.auth,
          },
        })
      : await prisma.pushSubscription.create({
          data: {
            userId: user.id,
            endpoint: data.endpoint,
            p256dh: data.keys.p256dh,
            auth: data.keys.auth,
          },
        });

    return successResponse(subscription, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
