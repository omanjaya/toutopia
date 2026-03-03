import { NextResponse } from "next/server";
import { PRICING } from "@/shared/lib/validators/payment.validators";

interface CreditBundleResponse {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

interface SubscriptionResponse {
  id: string;
  name: string;
  price: number;
  duration: string;
  plan: "MONTHLY" | "QUARTERLY" | "YEARLY";
}

interface PricingResponse {
  success: true;
  data: {
    creditBundles: CreditBundleResponse[];
    subscriptions: SubscriptionResponse[];
  };
}

export async function GET(): Promise<NextResponse<PricingResponse>> {
  const data: PricingResponse = {
    success: true,
    data: {
      creditBundles: [
        {
          id: "bundle5",
          name: PRICING.CREDIT_BUNDLE_5.label,
          credits: PRICING.CREDIT_BUNDLE_5.credits,
          price: PRICING.CREDIT_BUNDLE_5.price,
        },
        {
          id: "bundle10",
          name: PRICING.CREDIT_BUNDLE_10.label,
          credits: PRICING.CREDIT_BUNDLE_10.credits,
          price: PRICING.CREDIT_BUNDLE_10.price,
          popular: true,
        },
      ],
      subscriptions: [
        {
          id: "monthly",
          name: PRICING.SUBSCRIPTION_MONTHLY.label,
          price: PRICING.SUBSCRIPTION_MONTHLY.price,
          duration: "30 hari",
          plan: "MONTHLY",
        },
        {
          id: "quarterly",
          name: PRICING.SUBSCRIPTION_QUARTERLY.label,
          price: PRICING.SUBSCRIPTION_QUARTERLY.price,
          duration: "3 bulan",
          plan: "QUARTERLY",
        },
        {
          id: "yearly",
          name: PRICING.SUBSCRIPTION_YEARLY.label,
          price: PRICING.SUBSCRIPTION_YEARLY.price,
          duration: "1 tahun",
          plan: "YEARLY",
        },
      ],
    },
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
