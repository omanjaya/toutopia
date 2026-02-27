"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { InlineMath } from "./tiptap-math-extension";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Highlighter,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Undo,
  Redo,
  ImageIcon,
  Code,
  Code2,
  Loader2,
  Sigma,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Table as TableIcon,
  RemoveFormatting,
  Palette,
  ChevronDown,
  FlaskConical,
  Atom,
  Calculator,
  BarChart3,
  Grid3X3,
  Pi,
  Triangle,
  Infinity,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

/* ── Constants ── */
const FORMULA_CATEGORIES = [
  {
    label: "Aljabar",
    formulas: [
      { label: "Pecahan", latex: "\\frac{a}{b}" },
      { label: "Akar Kuadrat", latex: "\\sqrt{x}" },
      { label: "Akar Pangkat n", latex: "\\sqrt[n]{x}" },
      { label: "Pangkat", latex: "x^{n}" },
      { label: "Indeks Bawah", latex: "x_{n}" },
      { label: "Persamaan Kuadrat", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
      { label: "Logaritma", latex: "\\log_{a} b" },
      { label: "Logaritma Natural", latex: "\\ln x" },
      { label: "Nilai Mutlak", latex: "|x|" },
      { label: "Faktorial", latex: "n!" },
      { label: "Kombinasi", latex: "\\binom{n}{k} = \\frac{n!}{k!(n-k)!}" },
      { label: "Permutasi", latex: "P(n,k) = \\frac{n!}{(n-k)!}" },
      { label: "Deret Aritmatika", latex: "S_n = \\frac{n}{2}(2a + (n-1)d)" },
      { label: "Deret Geometri", latex: "S_n = a \\cdot \\frac{1 - r^n}{1 - r}" },
      { label: "Barisan Aritmatika", latex: "U_n = a + (n-1)d" },
      { label: "Barisan Geometri", latex: "U_n = a \\cdot r^{n-1}" },
    ],
  },
  {
    label: "Trigonometri",
    formulas: [
      { label: "sin", latex: "\\sin \\theta" },
      { label: "cos", latex: "\\cos \\theta" },
      { label: "tan", latex: "\\tan \\theta" },
      { label: "sin\u00B2 + cos\u00B2 = 1", latex: "\\sin^2 \\theta + \\cos^2 \\theta = 1" },
      { label: "sin 2\u03B8", latex: "\\sin 2\\theta = 2\\sin\\theta\\cos\\theta" },
      { label: "cos 2\u03B8", latex: "\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta" },
      { label: "Aturan Sinus", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}" },
      { label: "Aturan Cosinus", latex: "c^2 = a^2 + b^2 - 2ab\\cos C" },
      { label: "Luas Segitiga", latex: "L = \\frac{1}{2}ab\\sin C" },
    ],
  },
  {
    label: "Kalkulus",
    formulas: [
      { label: "Limit", latex: "\\lim_{x \\to a} f(x)" },
      { label: "Limit Tak Hingga", latex: "\\lim_{x \\to \\infty} f(x)" },
      { label: "Turunan", latex: "f'(x) = \\frac{df}{dx}" },
      { label: "Turunan Parsial", latex: "\\frac{\\partial f}{\\partial x}" },
      { label: "Turunan Pangkat", latex: "\\frac{d}{dx} x^n = nx^{n-1}" },
      { label: "Integral", latex: "\\int f(x)\\, dx" },
      { label: "Integral Tentu", latex: "\\int_{a}^{b} f(x)\\, dx" },
      { label: "Sigma / Jumlah", latex: "\\sum_{i=1}^{n} a_i" },
      { label: "Hasil Kali", latex: "\\prod_{i=1}^{n} a_i" },
    ],
  },
  {
    label: "Fisika",
    formulas: [
      { label: "Kecepatan", latex: "v = \\frac{s}{t}" },
      { label: "Percepatan", latex: "a = \\frac{\\Delta v}{\\Delta t}" },
      { label: "Hukum Newton II", latex: "F = m \\cdot a" },
      { label: "Energi Kinetik", latex: "E_k = \\frac{1}{2}mv^2" },
      { label: "Energi Potensial", latex: "E_p = mgh" },
      { label: "Usaha", latex: "W = F \\cdot s \\cdot \\cos\\theta" },
      { label: "Daya", latex: "P = \\frac{W}{t}" },
      { label: "Momentum", latex: "p = m \\cdot v" },
      { label: "Impuls", latex: "I = F \\cdot \\Delta t" },
      { label: "GLBB", latex: "s = v_0 t + \\frac{1}{2}at^2" },
      { label: "Kecepatan GLBB", latex: "v^2 = v_0^2 + 2as" },
      { label: "Gerak Parabola (x)", latex: "x = v_0 \\cos\\theta \\cdot t" },
      { label: "Gerak Parabola (y)", latex: "y = v_0 \\sin\\theta \\cdot t - \\frac{1}{2}gt^2" },
      { label: "Gaya Gravitasi", latex: "F = G\\frac{m_1 m_2}{r^2}" },
      { label: "Hukum Coulomb", latex: "F = k\\frac{q_1 q_2}{r^2}" },
      { label: "Hukum Ohm", latex: "V = I \\cdot R" },
      { label: "Daya Listrik", latex: "P = V \\cdot I" },
      { label: "Kapasitor", latex: "C = \\frac{Q}{V}" },
      { label: "Induktansi", latex: "\\varepsilon = -L\\frac{dI}{dt}" },
      { label: "Gelombang", latex: "v = \\lambda \\cdot f" },
      { label: "Energi Foton", latex: "E = h \\cdot f" },
      { label: "Relativitas Massa-Energi", latex: "E = mc^2" },
      { label: "Tekanan", latex: "P = \\frac{F}{A}" },
      { label: "Tekanan Hidrostatis", latex: "P = \\rho g h" },
      { label: "Gas Ideal", latex: "PV = nRT" },
      { label: "Pegas", latex: "F = -kx" },
      { label: "Periode Pegas", latex: "T = 2\\pi\\sqrt{\\frac{m}{k}}" },
      { label: "Periode Bandul", latex: "T = 2\\pi\\sqrt{\\frac{l}{g}}" },
    ],
  },
  {
    label: "Kimia",
    formulas: [
      { label: "Mol", latex: "n = \\frac{m}{M_r}" },
      { label: "Molaritas", latex: "M = \\frac{n}{V}" },
      { label: "pH Asam Kuat", latex: "pH = -\\log [H^+]" },
      { label: "pH Basa Kuat", latex: "pOH = -\\log [OH^-]" },
      { label: "pH + pOH", latex: "pH + pOH = 14" },
      { label: "Ka", latex: "K_a = \\frac{[H^+][A^-]}{[HA]}" },
      { label: "Ksp", latex: "K_{sp} = [A^+]^m [B^-]^n" },
      { label: "Laju Reaksi", latex: "v = k[A]^m[B]^n" },
      { label: "Hukum Hess", latex: "\\Delta H = \\sum \\Delta H_f(\\text{produk}) - \\sum \\Delta H_f(\\text{reaktan})" },
      { label: "Gas Ideal", latex: "PV = nRT" },
      { label: "Persamaan Nernst", latex: "E = E^\\circ - \\frac{RT}{nF}\\ln Q" },
      { label: "Reaksi Kesetimbangan", latex: "K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}" },
    ],
  },
  {
    label: "Simbol",
    formulas: [
      { label: "Tidak Sama Dengan", latex: "\\neq" },
      { label: "Kurang dari sama dengan", latex: "\\leq" },
      { label: "Lebih dari sama dengan", latex: "\\geq" },
      { label: "Kira-kira", latex: "\\approx" },
      { label: "Plus Minus", latex: "\\pm" },
      { label: "Tak Hingga", latex: "\\infty" },
      { label: "Panah Kanan", latex: "\\rightarrow" },
      { label: "Panah Kesetimbangan", latex: "\\rightleftharpoons" },
      { label: "Derajat", latex: "^\\circ" },
      { label: "Alpha", latex: "\\alpha" },
      { label: "Beta", latex: "\\beta" },
      { label: "Gamma", latex: "\\gamma" },
      { label: "Delta", latex: "\\Delta" },
      { label: "Theta", latex: "\\theta" },
      { label: "Lambda", latex: "\\lambda" },
      { label: "Mu", latex: "\\mu" },
      { label: "Pi", latex: "\\pi" },
      { label: "Sigma", latex: "\\sigma" },
      { label: "Omega", latex: "\\omega" },
      { label: "Epsilon", latex: "\\varepsilon" },
      { label: "Rho", latex: "\\rho" },
      { label: "Phi", latex: "\\phi" },
      { label: "Tau", latex: "\\tau" },
    ],
  },
  {
    label: "Matriks & Vektor",
    formulas: [
      { label: "Matriks 2x2", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { label: "Matriks 3x3", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
      { label: "Determinan 2x2", latex: "\\det(A) = ad - bc" },
      { label: "Determinan 3x3", latex: "\\det(A) = a(ei-fh) - b(di-fg) + c(dh-eg)" },
      { label: "Vektor", latex: "\\vec{v} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}" },
      { label: "Vektor 3D", latex: "\\vec{v} = x\\hat{i} + y\\hat{j} + z\\hat{k}" },
      { label: "Dot Product", latex: "\\vec{a} \\cdot \\vec{b} = |a||b|\\cos\\theta" },
      { label: "Cross Product", latex: "\\vec{a} \\times \\vec{b}" },
      { label: "Sistem Persamaan", latex: "\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}" },
    ],
  },
  {
    label: "Statistika",
    formulas: [
      { label: "Rata-rata", latex: "\\bar{x} = \\frac{\\sum x_i}{n}" },
      { label: "Varians", latex: "s^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n-1}" },
      { label: "Standar Deviasi", latex: "s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n-1}}" },
      { label: "Median (genap)", latex: "Me = \\frac{x_{n/2} + x_{n/2+1}}{2}" },
      { label: "Peluang", latex: "P(A) = \\frac{n(A)}{n(S)}" },
      { label: "Peluang Gabungan", latex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" },
      { label: "Peluang Bersyarat", latex: "P(A|B) = \\frac{P(A \\cap B)}{P(B)}" },
      { label: "Distribusi Normal", latex: "z = \\frac{x - \\mu}{\\sigma}" },
    ],
  },
];

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Merah", value: "#dc2626" },
  { label: "Biru", value: "#2563eb" },
  { label: "Hijau", value: "#16a34a" },
  { label: "Oranye", value: "#ea580c" },
  { label: "Ungu", value: "#9333ea" },
  { label: "Abu-abu", value: "#6b7280" },
];

/* ── Props ── */
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

/* ── Main Component ── */
export function RichTextEditor({
  content,
  onChange,
  placeholder = "Tulis konten di sini...",
  className,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExt.configure({ inline: true }),
      Placeholder.configure({ placeholder }),
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      InlineMath,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[150px] px-3 py-2 focus:outline-none [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-semibold",
      },
    },
  });

  const insertMath = useCallback(
    (latex = "x^2") => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "inlineMath",
          attrs: { latex },
        })
        .run();
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link").href as string) ?? "";
    const url = window.prompt("URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  if (!editor) return null;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.message ?? "Gagal mengupload gambar");
        return;
      }
      editor.chain().focus().setImage({ src: result.data.url }).run();
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className={cn("rounded-lg border", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          tooltip="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          tooltip="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          tooltip="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          tooltip="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        {/* Subscript / Superscript */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive("subscript")}
          tooltip="Subscript (H₂O)"
        >
          <SubIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive("superscript")}
          tooltip="Superscript (x²)"
        >
          <SupIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          tooltip="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="bottom" align="start">
            <div className="flex gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value || "default"}
                  type="button"
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                    editor.isActive("textStyle", { color: c.value })
                      ? "border-primary scale-110"
                      : "border-transparent"
                  )}
                  style={{
                    backgroundColor: c.value || "var(--foreground)",
                  }}
                  onClick={() => {
                    if (c.value) {
                      editor.chain().focus().setColor(c.value).run();
                    } else {
                      editor.chain().focus().unsetColor().run();
                    }
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          tooltip="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          tooltip="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          tooltip="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          tooltip="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          tooltip="Blockquote (Kutipan)"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          tooltip="Rata Kiri"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          tooltip="Rata Tengah"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          tooltip="Rata Kanan"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        {/* Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          tooltip="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          tooltip="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        {/* Special inserts */}
        <ToolbarButton onClick={() => insertMath()} tooltip="Rumus Kosong (LaTeX)">
          <Sigma className="h-4 w-4" />
        </ToolbarButton>
        <FormulaDropdown onInsert={insertMath} />
        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} tooltip="Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            tooltip="Hapus Link"
          >
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={insertTable} tooltip="Sisipkan Tabel 3×3">
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Garis Horizontal"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          tooltip="Upload Gambar"
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        {/* Utilities */}
        <ToolbarButton onClick={clearFormatting} tooltip="Hapus Format">
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
        <div className="flex-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* ── Editor Area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}

/* ── Toolbar Button ── */
interface ToolbarButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
}

function ToolbarButton({
  onClick,
  children,
  isActive,
  disabled,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", isActive && "bg-muted text-primary")}
          onClick={onClick}
          disabled={disabled}
          data-active={isActive || undefined}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Category Icons ── */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Aljabar: Calculator,
  Trigonometri: Triangle,
  Kalkulus: Infinity,
  Fisika: Atom,
  Kimia: FlaskConical,
  Simbol: Pi,
  "Matriks & Vektor": Grid3X3,
  Statistika: BarChart3,
};

/* ── Formula Dropdown ── */
function FormulaDropdown({ onInsert }: { onInsert: (latex: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-7 gap-1 px-2 text-xs"
        >
          <Pi className="h-3.5 w-3.5" />
          Rumus
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[520px] p-0"
        side="bottom"
        align="start"
      >
        <div className="flex h-[360px]">
          {/* Category sidebar */}
          <div className="w-[150px] shrink-0 border-r bg-muted/30 p-1 overflow-y-auto">
            {FORMULA_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.label] ?? Calculator;
              return (
                <button
                  key={cat.label}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                    activeCategory === cat.label
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setActiveCategory(cat.label)}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Formula grid */}
          <div className="flex-1 overflow-y-auto p-2">
            {!activeCategory ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Pilih kategori di sebelah kiri
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {FORMULA_CATEGORIES.find(
                  (c) => c.label === activeCategory
                )?.formulas.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    className="flex flex-col items-start gap-0.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/50"
                    onClick={() => onInsert(f.latex)}
                    title={f.latex}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {f.label}
                    </span>
                    <span className="font-mono text-xs text-foreground line-clamp-1">
                      {f.latex.length > 30
                        ? f.latex.slice(0, 30) + "..."
                        : f.latex}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
