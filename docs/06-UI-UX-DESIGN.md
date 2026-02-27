# UI/UX Design Guidelines - Toutopia (macOS Aesthetic)

## 1. Design Philosophy
**"Clarity, Deference, and Depth."**
Mengadopsi prinsip desain Apple (Human Interface Guidelines), Toutopia akan fokus pada konten, menggunakan ruang putih yang efektif, dan elemen antarmuka yang halus namun berkarakter.

*   **Aesthetic:** Clean, Premium, Airy.
*   **Inspiration:** macOS Sequoia, iOS 18.
*   **Key Characteristics:**
    *   Translucent materials (Sidebar & Overlays).
    *   Soft shadows & depth.
    *   Rounded corners (Continuous curvature).
    *   Refined typography (Inter).

## 2. Color System

### Palette Utama (Light Mode)
*   **App Background:** `#F5F5F7` (Off-white khas Apple).
*   **Surface/Card:** `#FFFFFF` (Pure white).
*   **Primary Accent:** `#007AFF` (Apple Blue) atau `#5856D6` (Apple Indigo) — *User to confirm preference*.
*   **Text Primary:** `#1D1D1F` (Soft Black).
*   **Text Secondary:** `#86868B` (Mac Gray).
*   **Border/Divider:** `#E5E5E5` (Subtle).

### Palette Utama (Dark Mode)
*   **App Background:** `#000000` atau `#1C1C1E`.
*   **Surface/Card:** `#1C1C1E` (Elevated dark gray).
*   **Text Primary:** `#F5F5F7`.
*   **Border:** `#38383A`.

## 3. Typography
Menggunakan **Inter** sebagai pengganti San Francisco (SF Pro) karena kemiripannya yang tinggi dan ketersediaan di Google Fonts.

*   **Headings:** Inter Display (font-weight: 600/700). Tracking `-0.02em` untuk kesan tight & modern.
*   **Body:** Inter (font-weight: 400).
*   **Micro-copy:** Inter (font-weight: 500).

## 4. UI Components (Shadcn/Tailwind Adaptation)

### Cards & Surfaces
*   **Style:** Minimalist, no heavy borders.
*   **Shadow:** `shadow-sm` atau `shadow-md` yang sangat halus dan menyebar (diffused).
*   **Radius:** `rounded-xl` atau `rounded-2xl` (16px - 20px).

### Sidebar & Navigation
*   **Material:** Background blur (Frosted Glass).
    *   `bg-white/80 backdrop-blur-xl border-r border-gray-200/50` (Light).
    *   `bg-[#1C1C1E]/80 backdrop-blur-xl border-r border-white/5` (Dark).
*   **Active State:** Rounded rect dengan background accent color yang sangat subtle (e.g., `bg-blue-50 text-blue-600`).

### Buttons
*   **Primary:** Solid color, no gradient, `rounded-full` (Pill shape) atau `rounded-lg`.
*   **Secondary:** White background, gray border, soft shadow.
*   **Ghost:** Transparent, darken on hover.

### Inputs & Forms
*   **Style:** Flat, gray background (`bg-gray-100/50`) saat inactive, white + ring saat focus.
*   **Focus Ring:** `ring-2 ring-blue-500/20` (Glow effect, bukan solid stroke).

## 5. Iconography
*   **Library:** Lucide React.
*   **Style:** Stroke width `1.5px` atau `2px` (Thin & Crisp).
*   **Color:** Sesuai teks, atau accent color untuk active state.

## 6. Layout & Spacing
*   **Whitespace:** Generous. Beri jarak antar elemen agar "bernafas".
*   **Center Stage:** Konten utama (soal ujian, dashboard) diletakkan di tengah dengan *max-width* yang nyaman dibaca (e.g., `max-w-5xl`).

## 7. Motion & Interaction
*   **Transitions:** Cepat dan responsif (`duration-200 ease-out`).
*   **Feedback:** Scale down sedikit saat button ditekan (`active:scale-95`).
