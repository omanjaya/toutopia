"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Coins,
  FileText,
  CreditCard,
  Save,
  Trash2,
  Plus,
  Package,
  Settings,
  Key,
  History,
  Gift,
  Phone,
  Calendar,
  ExternalLink,
  Copy,
  RotateCcw,
  ChevronLeft,
  User,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { formatCurrency, getInitials } from "@/shared/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Breadcrumb } from "@/shared/components/layout/breadcrumb";

const cardCls =
  "rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]";

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  role: string;
  status: string;
  referralCode: string | null;
  referredById: string | null;
  referredBy: { name: string } | null;
  lastLoginAt: string | null;
  createdAt: string;
  credits: { balance: number; freeCredits: number } | null;
  creditHistory: {
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
  }[];
  attempts: {
    id: string;
    status: string;
    score: number | null;
    startedAt: string;
    finishedAt: string | null;
    package: { id: string; title: string };
  }[];
  transactions: {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    package: { id: string; title: string } | null;
  }[];
  packageAccesses: {
    id: string;
    grantedBy: string;
    grantedAt: string;
    expiresAt: string | null;
    reason: string | null;
    package: { id: string; title: string };
  }[];
}

interface PackageOption {
  id: string;
  title: string;
}

interface UserDetailProps {
  user: UserData;
  packages: PackageOption[];
  attemptCount: number;
  transactionCount: number;
}

const roleBadgeClass: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-700 border-red-200 text-xs",
  ADMIN: "bg-red-500/10 text-red-700 border-red-200 text-xs",
  TEACHER: "bg-blue-500/10 text-blue-700 border-blue-200 text-xs",
  STUDENT: "bg-slate-500/10 text-slate-700 border-slate-200 text-xs",
};

const statusBadgeClass: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-700 border-green-200 text-xs",
  SUSPENDED: "bg-yellow-500/10 text-yellow-700 border-yellow-200 text-xs",
  BANNED: "bg-red-500/10 text-red-700 border-red-200 text-xs",
};

const attemptStatusBadgeClass: Record<string, string> = {
  COMPLETED: "bg-green-500/10 text-green-700 border-green-200 text-xs",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 border-blue-200 text-xs",
  TIMED_OUT: "bg-yellow-500/10 text-yellow-700 border-yellow-200 text-xs",
  ABANDONED: "bg-red-500/10 text-red-700 border-red-200 text-xs",
};

const txStatusBadgeClass: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-700 border-green-200 text-xs",
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-200 text-xs",
  EXPIRED: "bg-slate-500/10 text-slate-700 border-slate-200 text-xs",
  FAILED: "bg-red-500/10 text-red-700 border-red-200 text-xs",
  REFUNDED: "bg-slate-500/10 text-slate-700 border-slate-200 text-xs",
};

const creditTypeBadgeClass: Record<string, string> = {
  PURCHASE: "bg-blue-500/10 text-blue-700 border-blue-200 text-xs",
  BONUS: "bg-green-500/10 text-green-700 border-green-200 text-xs",
  FREE_SIGNUP: "bg-purple-500/10 text-purple-700 border-purple-200 text-xs",
  REFUND: "bg-slate-500/10 text-slate-700 border-slate-200 text-xs",
  USAGE: "bg-red-500/10 text-red-700 border-red-200 text-xs",
};

export function UserDetail({ user, packages, attemptCount, transactionCount }: UserDetailProps) {
  const router = useRouter();

  const [role, setRole] = useState(user.role);
  const [savingRole, setSavingRole] = useState(false);

  const [status, setStatus] = useState(user.status);
  const [savingStatus, setSavingStatus] = useState(false);

  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");
  const [grantingCredit, setGrantingCredit] = useState(false);

  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [accessReason, setAccessReason] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [resettingPassword, setResettingPassword] = useState(false);

  async function handleSaveRole() {
    if (role === user.role) return;
    setSavingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal mengubah role");
        return;
      }
      toast.success("Role berhasil diubah");
      router.refresh();
    } finally {
      setSavingRole(false);
    }
  }

  async function handleSaveStatus() {
    if (status === user.status) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal mengubah status");
        return;
      }
      toast.success("Status berhasil diubah");
      router.refresh();
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleGrantCredit() {
    const amount = parseInt(creditAmount, 10);
    if (!amount || amount <= 0) {
      toast.error("Masukkan jumlah kredit yang valid");
      return;
    }
    setGrantingCredit(true);
    try {
      const res = await fetch("/api/admin/credits/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          description: creditDesc || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal memberikan kredit");
        return;
      }
      toast.success(`${amount} kredit berhasil ditambahkan`);
      setCreditAmount("");
      setCreditDesc("");
      router.refresh();
    } finally {
      setGrantingCredit(false);
    }
  }

  async function handleGrantAccess() {
    if (!selectedPackageId) {
      toast.error("Pilih paket ujian");
      return;
    }
    setGrantingAccess(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/package-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackageId,
          reason: accessReason || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal memberikan akses");
        return;
      }
      toast.success("Akses paket berhasil diberikan");
      setSelectedPackageId("");
      setAccessReason("");
      router.refresh();
    } finally {
      setGrantingAccess(false);
    }
  }

  async function handleRevokeAccess(accessId: string) {
    if (!confirm("Yakin ingin mencabut akses paket ini?")) return;
    setRevokingId(accessId);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/package-access`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal mencabut akses");
        return;
      }
      toast.success("Akses paket berhasil dicabut");
      router.refresh();
    } finally {
      setRevokingId(null);
    }
  }

  async function handleResetPassword() {
    if (!confirm("Yakin ingin mereset password user ini?")) return;
    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal mereset password");
        return;
      }
      if (result.data?.temporaryPassword) {
        toast.success(`Password baru: ${result.data.temporaryPassword}`, {
          duration: 15000,
        });
      } else {
        toast.success("Link reset password telah dikirim");
      }
    } finally {
      setResettingPassword(false);
    }
  }

  function handleCopyReferralCode() {
    if (!user.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Kode referral disalin");
  }

  const balance = user.credits?.balance ?? 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Pengguna", href: "/admin/users" },
          { label: user.name },
        ]}
      />

      {/* Sub-page Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href="/admin/users">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge className={roleBadgeClass[user.role] ?? "text-xs"}>
            {user.role}
          </Badge>
          <Badge className={statusBadgeClass[user.status] ?? "text-xs"}>
            {user.status}
          </Badge>
        </div>
      </div>

      {/* User Info Card */}
      <div className={cardCls}>
        <SectionHeader icon={Info} title="Informasi Pengguna" />
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Telepon:</span>
              <span className="text-sm font-medium">{user.phone ?? "Tidak ada"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Kode Referral:</span>
              <span className="text-sm font-medium">{user.referralCode ?? "-"}</span>
              {user.referralCode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyReferralCode}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Direferensikan oleh:</span>
              <span className="text-sm font-medium">{user.referredBy?.name ?? "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Terdaftar:</span>
              <span className="text-sm font-medium">
                {format(new Date(user.createdAt), "dd MMM yyyy HH:mm", { locale: localeId })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Login Terakhir:</span>
              <span className="text-sm font-medium">
                {user.lastLoginAt
                  ? format(new Date(user.lastLoginAt), "dd MMM yyyy HH:mm", { locale: localeId })
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className={cardCls}>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Kredit</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums">{balance}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
              <Coins className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Ujian</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums">{attemptCount}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Transaksi</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums">{transactionCount}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Free Credits</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums">{user.credits?.freeCredits ?? 0}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Akses Paket</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums">{user.packageAccesses.length}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="mr-1.5 h-4 w-4" />
            Pengaturan
          </TabsTrigger>
          <TabsTrigger value="access">
            <Key className="mr-1.5 h-4 w-4" />
            Akses Paket
          </TabsTrigger>
          <TabsTrigger value="credits">
            <Coins className="mr-1.5 h-4 w-4" />
            Riwayat Kredit
          </TabsTrigger>
          <TabsTrigger value="exams">
            <FileText className="mr-1.5 h-4 w-4" />
            Riwayat Ujian
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="mr-1.5 h-4 w-4" />
            Transaksi
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 pt-4">
          {/* Role */}
          <div className={cardCls}>
            <SectionHeader icon={User} title="Role" description="Ubah role pengguna" />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">STUDENT</SelectItem>
                    <SelectItem value="TEACHER">TEACHER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleSaveRole}
                  disabled={savingRole || role === user.role}
                >
                  {savingRole ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan
                </Button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className={cardCls}>
            <SectionHeader icon={ShieldCheck} title="Status" description="Ubah status akun pengguna" />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                    <SelectItem value="BANNED">BANNED</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleSaveStatus}
                  disabled={savingStatus || status === user.status}
                >
                  {savingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan
                </Button>
              </div>
            </div>
          </div>

          {/* Grant Kredit */}
          <div className={cardCls}>
            <SectionHeader icon={Coins} title="Grant Kredit" description="Tambahkan kredit ke akun pengguna" />
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Jumlah</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-32"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Deskripsi (opsional)</label>
                  <Input
                    placeholder="Alasan pemberian kredit..."
                    value={creditDesc}
                    onChange={(e) => setCreditDesc(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGrantCredit}
                  disabled={grantingCredit || !creditAmount}
                >
                  {grantingCredit ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Grant Kredit
                </Button>
              </div>
            </div>
          </div>

          {/* Grant Akses Paket */}
          <div className={cardCls}>
            <SectionHeader icon={Package} title="Grant Akses Paket" description="Berikan akses paket ujian secara manual" />
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Paket Ujian</label>
                  <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Pilih paket..." />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Alasan (opsional)</label>
                  <Input
                    placeholder="Alasan pemberian akses..."
                    value={accessReason}
                    onChange={(e) => setAccessReason(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGrantAccess}
                  disabled={grantingAccess || !selectedPackageId}
                >
                  {grantingAccess ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="mr-2 h-4 w-4" />
                  )}
                  Grant Akses
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Password */}
          <div className={cardCls}>
            <SectionHeader icon={Key} title="Reset Password" description="Reset password pengguna" />
            <div className="p-5">
              <p className="mb-3 text-sm text-muted-foreground">
                Mereset password user akan menghasilkan password sementara atau mengirim link reset.
              </p>
              <Button
                variant="destructive"
                onClick={handleResetPassword}
                disabled={resettingPassword}
              >
                {resettingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Reset Password
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Package Access Tab */}
        <TabsContent value="access" className="pt-4">
          <div className={cardCls}>
            <SectionHeader icon={Package} title={`Akses Paket (${user.packageAccesses.length})`} />
            <div className="p-5">
              {user.packageAccesses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada akses paket yang diberikan
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paket</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Diberikan</TableHead>
                      <TableHead>Kadaluarsa</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.packageAccesses.map((access) => (
                      <TableRow key={access.id}>
                        <TableCell className="font-medium">
                          {access.package.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {access.reason ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(access.grantedAt), "dd MMM yyyy", {
                            locale: localeId,
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {access.expiresAt
                            ? format(new Date(access.expiresAt), "dd MMM yyyy", {
                                locale: localeId,
                              })
                            : "Permanen"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeAccess(access.id)}
                            disabled={revokingId === access.id}
                          >
                            {revokingId === access.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Credit History Tab */}
        <TabsContent value="credits" className="pt-4">
          <div className={cardCls}>
            <SectionHeader icon={Coins} title="Riwayat Kredit" />
            <div className="p-5">
              {user.creditHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada riwayat kredit
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.creditHistory.map((ch) => (
                      <TableRow key={ch.id}>
                        <TableCell
                          className={
                            ch.amount > 0
                              ? "font-medium text-green-600"
                              : "font-medium text-red-600"
                          }
                        >
                          {ch.amount > 0 ? "+" : ""}
                          {ch.amount}
                        </TableCell>
                        <TableCell>
                          <Badge className={creditTypeBadgeClass[ch.type] ?? "text-xs"}>
                            {ch.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ch.description ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(ch.createdAt), "dd MMM yyyy HH:mm", {
                            locale: localeId,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Exam History Tab */}
        <TabsContent value="exams" className="pt-4">
          <div className={cardCls}>
            <SectionHeader icon={FileText} title="Riwayat Ujian" />
            <div className="p-5">
              {user.attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada riwayat ujian
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Mulai</TableHead>
                      <TableHead>Selesai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/exam/${attempt.id}/result`}
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            {attempt.package.title}
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={attemptStatusBadgeClass[attempt.status] ?? "text-xs"}>
                            {attempt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {attempt.score !== null
                            ? attempt.score.toFixed(1)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(
                            new Date(attempt.startedAt),
                            "dd MMM yyyy HH:mm",
                            { locale: localeId }
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {attempt.finishedAt
                            ? format(
                                new Date(attempt.finishedAt),
                                "dd MMM yyyy HH:mm",
                                { locale: localeId }
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="pt-4">
          <div className={cardCls}>
            <SectionHeader icon={CreditCard} title="Transaksi" />
            <div className="p-5">
              {user.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada transaksi
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paket</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">
                          {tx.package?.title ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={txStatusBadgeClass[tx.status] ?? "text-xs"}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tx.paymentMethod ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(
                            new Date(tx.createdAt),
                            "dd MMM yyyy HH:mm",
                            { locale: localeId }
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
