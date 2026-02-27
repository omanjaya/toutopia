"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
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

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  SUPER_ADMIN: "destructive",
  ADMIN: "destructive",
  TEACHER: "default",
  STUDENT: "secondary",
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "default",
  SUSPENDED: "outline",
  BANNED: "destructive",
};

const attemptStatusBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  COMPLETED: "default",
  IN_PROGRESS: "secondary",
  TIMED_OUT: "outline",
  ABANDONED: "destructive",
};

const txStatusBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PAID: "default",
  PENDING: "secondary",
  EXPIRED: "outline",
  FAILED: "destructive",
  REFUNDED: "outline",
};

const creditTypeBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PURCHASE: "default",
  BONUS: "default",
  FREE_SIGNUP: "secondary",
  REFUND: "outline",
  USAGE: "destructive",
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={roleBadgeVariant[user.role] ?? "secondary"}>
            {user.role}
          </Badge>
          <Badge variant={statusBadgeVariant[user.status] ?? "secondary"}>
            {user.status}
          </Badge>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Kredit</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{balance}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Ujian</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{attemptCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{transactionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Free Credits</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{user.credits?.freeCredits ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Akses Paket</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{user.packageAccesses.length}</p>
          </CardContent>
        </Card>
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
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grant Kredit</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grant Akses Paket</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Package Access Tab */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Akses Paket ({user.packageAccesses.length})</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit History Tab */}
        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Kredit</CardTitle>
            </CardHeader>
            <CardContent>
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
                          <Badge
                            variant={creditTypeBadge[ch.type] ?? "secondary"}
                          >
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam History Tab */}
        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Ujian</CardTitle>
            </CardHeader>
            <CardContent>
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
                          <Badge
                            variant={
                              attemptStatusBadge[attempt.status] ?? "secondary"
                            }
                          >
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
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
                          <Badge
                            variant={txStatusBadge[tx.status] ?? "secondary"}
                          >
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
