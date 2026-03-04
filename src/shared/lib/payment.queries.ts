import { prisma } from "@/shared/lib/prisma";

// ---------------------------------------------------------------------------
// Simple scalar types
// ---------------------------------------------------------------------------

export interface UserCreditData {
  balance: number;
}

export interface ActiveSubscriptionData {
  id: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  bundle: { name: string };
}

export interface TargetPackageData {
  id: string;
  title: string;
  price: number;
  totalQuestions: number;
  durationMinutes: number;
}

export interface PaymentPageData {
  creditBalance: number;
  targetPackage: TargetPackageData | null;
}

// ---------------------------------------------------------------------------
// Individual queries (declared before derived types that use ReturnType<...>)
// ---------------------------------------------------------------------------

export async function getUserCredit(userId: string): Promise<UserCreditData> {
  const credit = await prisma.userCredit.findUnique({
    where: { userId },
    select: { balance: true },
  });
  return { balance: credit?.balance ?? 0 };
}

export async function getActiveSubscription(
  userId: string
): Promise<ActiveSubscriptionData | null> {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
    },
    select: {
      id: true,
      plan: true,
      status: true,
      startDate: true,
      endDate: true,
      bundle: { select: { name: true } },
    },
    orderBy: { endDate: "desc" },
  });
}

export async function getTransactionHistory(
  userId: string,
  opts: { skip?: number; take?: number } = {}
): Promise<
  Array<{
    id: string;
    userId: string;
    amount: number;
    status: string;
    snapToken: string | null;
    midtransUrl: string | null;
    midtransId: string | null;
    paymentMethod: string | null;
    metadata: unknown;
    ebookId: string | null;
    createdAt: Date;
    package: { title: string } | null;
    ebook: { title: string } | null;
  }>
> {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: opts.skip ?? 0,
    take: opts.take ?? 50,
    include: {
      package: { select: { title: true } },
      ebook: { select: { title: true } },
    },
  });
}

export async function countTransactions(userId: string): Promise<number> {
  return prisma.transaction.count({ where: { userId } });
}

export async function getCreditHistory(
  userId: string,
  take: number = 20
): Promise<
  Array<{
    id: string;
    userId: string;
    amount: number;
    type: string;
    description: string | null;
    referenceId: string | null;
    createdAt: Date;
  }>
> {
  return prisma.creditHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getTargetPackage(
  packageId: string
): Promise<TargetPackageData | null> {
  const pkg = await prisma.examPackage.findUnique({
    where: { id: packageId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      price: true,
      discountPrice: true,
      isFree: true,
      totalQuestions: true,
      durationMinutes: true,
    },
  });

  if (!pkg || pkg.isFree) return null;

  return {
    id: pkg.id,
    title: pkg.title,
    price: pkg.discountPrice ?? pkg.price,
    totalQuestions: pkg.totalQuestions,
    durationMinutes: pkg.durationMinutes,
  };
}

// ---------------------------------------------------------------------------
// Derived row types (kept as type aliases so callers can annotate with them)
// ---------------------------------------------------------------------------

// Matches the include shape in getTransactionHistory.
export type TransactionWithRelations = Awaited<
  ReturnType<typeof getTransactionHistory>
>[number];

// Matches the select shape in getCreditHistory.
export type CreditHistoryRow = Awaited<
  ReturnType<typeof getCreditHistory>
>[number];

// ---------------------------------------------------------------------------
// Composite query interface (used by payment history page: desktop + mobile)
// ---------------------------------------------------------------------------

export interface PaymentHistoryPageData {
  creditBalance: number;
  activeSubscription: ActiveSubscriptionData | null;
  transactions: TransactionWithRelations[];
  totalTransactions: number;
  creditHistory: CreditHistoryRow[];
}

// ---------------------------------------------------------------------------
// Composite queries
// ---------------------------------------------------------------------------

export async function getPaymentPageData(
  userId: string,
  packageId: string | undefined
): Promise<PaymentPageData> {
  const [credit, targetPackage] = await Promise.all([
    getUserCredit(userId),
    packageId ? getTargetPackage(packageId) : Promise.resolve(null),
  ]);

  return { creditBalance: credit.balance, targetPackage };
}

export async function getPaymentHistoryData(
  userId: string,
  opts: { skip?: number; take?: number; creditHistoryTake?: number } = {}
): Promise<PaymentHistoryPageData> {
  const [
    credit,
    activeSubscription,
    transactions,
    totalTransactions,
    creditHistory,
  ] = await Promise.all([
    getUserCredit(userId),
    getActiveSubscription(userId),
    getTransactionHistory(userId, { skip: opts.skip, take: opts.take }),
    countTransactions(userId),
    getCreditHistory(userId, opts.creditHistoryTake),
  ]);

  return {
    creditBalance: credit.balance,
    activeSubscription,
    transactions,
    totalTransactions,
    creditHistory,
  };
}
