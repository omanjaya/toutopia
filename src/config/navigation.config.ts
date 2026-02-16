export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export const publicNav: NavItem[] = [
  { title: "Beranda", href: "/" },
  { title: "Paket Try Out", href: "/packages" },
  { title: "Harga", href: "/pricing" },
  { title: "Blog", href: "/blog" },
  { title: "FAQ", href: "/faq" },
];

export const studentNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Try Out", href: "/dashboard/tryout", icon: "BookOpen" },
  { title: "Riwayat", href: "/dashboard/history", icon: "History" },
  { title: "Analitik", href: "/dashboard/analytics", icon: "BarChart3" },
  { title: "Planner", href: "/dashboard/planner", icon: "CalendarDays" },
  { title: "Bookmark", href: "/dashboard/bookmarks", icon: "Bookmark" },
];

export const teacherNav: NavItem[] = [
  { title: "Dashboard", href: "/teacher/dashboard", icon: "LayoutDashboard" },
  { title: "Soal Saya", href: "/teacher/questions", icon: "FileText" },
  { title: "Buat Soal", href: "/teacher/questions/new", icon: "FilePlus" },
  { title: "Penghasilan", href: "/teacher/earnings", icon: "Wallet" },
  { title: "Profil", href: "/teacher/profile", icon: "User" },
];

export const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { title: "Pengguna", href: "/admin/users", icon: "Users" },
  { title: "Moderasi Soal", href: "/admin/questions", icon: "FileCheck" },
  { title: "Paket Ujian", href: "/admin/packages", icon: "Package" },
  { title: "Transaksi", href: "/admin/transactions", icon: "CreditCard" },
  { title: "Payout", href: "/admin/payouts", icon: "Banknote" },
  { title: "Artikel", href: "/admin/articles", icon: "Newspaper" },
  { title: "Pengaturan", href: "/admin/settings", icon: "Settings" },
];

export const examCategoryNav: NavItem[] = [
  {
    title: "UTBK-SNBT",
    href: "/tryout-utbk",
    description: "Seleksi Nasional Berdasarkan Tes",
  },
  {
    title: "CPNS",
    href: "/tryout-cpns",
    description: "Calon Pegawai Negeri Sipil",
  },
  {
    title: "BUMN",
    href: "/tryout-bumn",
    description: "Rekrutmen Bersama BUMN",
  },
  {
    title: "Kedinasan",
    href: "/tryout-kedinasan",
    description: "STAN, STIS, IPDN, SSG, STIN",
  },
  {
    title: "PPPK",
    href: "/tryout-pppk",
    description: "Pegawai Pemerintah dengan Perjanjian Kerja",
  },
];
