import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { requireAuth } from "@/shared/lib/auth-guard";
import { successResponse } from "@/shared/lib/api-response";
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

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: {
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userId: user.id,
      },
      create: {
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
