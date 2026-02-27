import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { requireRole } from "@/shared/lib/auth-guard";
import { successResponse, errorResponse } from "@/shared/lib/api-response";
import { handleApiError } from "@/shared/lib/api-error";
import { encrypt, decrypt, maskApiKey } from "@/shared/lib/encryption";
import {
  testConnection,
  PROVIDER_MODELS,
  PROVIDER_INFO,
} from "@/infrastructure/ai/ai-provider.service";
import { z } from "zod";

const updateSettingsSchema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().optional(),
  model: z.string().min(1),
  isActive: z.boolean(),
});

const testConnectionSchema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  model: z.string().min(1),
});

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN"]);

    const configs = await prisma.aiProviderConfig.findMany({
      orderBy: { provider: "asc" },
    });

    const providers = Object.keys(PROVIDER_INFO).map((providerId) => {
      const config = configs.find((c) => c.provider === providerId);
      const info = PROVIDER_INFO[providerId];
      const models = PROVIDER_MODELS[providerId] ?? [];

      return {
        provider: providerId,
        name: info.name,
        description: info.description,
        models,
        isActive: config?.isActive ?? false,
        model: config?.model ?? models[0]?.id ?? "",
        hasApiKey: Boolean(config?.apiKey),
        maskedApiKey: config?.apiKey ? maskApiKey(decrypt(config.apiKey)) : "",
      };
    });

    return successResponse(providers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN"]);

    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    const existing = await prisma.aiProviderConfig.findUnique({
      where: { provider: data.provider },
    });

    const updateData: {
      model: string;
      isActive: boolean;
      apiKey?: string;
    } = {
      model: data.model,
      isActive: data.isActive,
    };

    if (data.apiKey) {
      updateData.apiKey = encrypt(data.apiKey);
    }

    if (existing) {
      await prisma.aiProviderConfig.update({
        where: { provider: data.provider },
        data: updateData,
      });
    } else {
      if (!data.apiKey) {
        return errorResponse(
          "API_KEY_REQUIRED",
          "API key diperlukan untuk provider baru",
          400
        );
      }
      await prisma.aiProviderConfig.create({
        data: {
          provider: data.provider,
          apiKey: encrypt(data.apiKey),
          model: data.model,
          isActive: data.isActive,
        },
      });
    }

    return successResponse({ saved: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN"]);

    const body = await request.json();
    const data = testConnectionSchema.parse(body);

    let apiKey = data.apiKey;

    // If client sends "use-saved", retrieve the actual key from DB
    if (apiKey === "use-saved") {
      const config = await prisma.aiProviderConfig.findUnique({
        where: { provider: data.provider },
      });
      if (!config?.apiKey) {
        return successResponse({
          success: false,
          message: "Tidak ada API key tersimpan untuk provider ini",
        });
      }
      apiKey = decrypt(config.apiKey);
    }

    const result = await testConnection(data.provider, apiKey, data.model);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
