# Design Brief

## Direction

Pit Lane — an industrial-technical department site for Jurusan Teknik Sepeda Motor, SMKN 9 Malang: warm paper surfaces, steel-blue ink, and a safety-orange signal accent. Extended for a public-facing homepage: lab calendar, org chart, Instagram news grid, and a decorative photo band.

## Tone

Industrial/utilitarian — workshop signage and service manuals, executed with editorial precision rather than decoration.

## Differentiation

Numbers carry the interface: every quantity, rule number, stock count, calendar date, and rupiah figure is set in tabular monospace with an orange rule numeral, so the site reads like a well-kept service logbook. The lab calendar's three-color coding makes the workshop schedule legible at a glance.

## Color Palette

| Token      | OKLCH         | Role                                          |
| ---------- | ------------- | --------------------------------------------- |
| background | 0.975 0.006 85 | Warm paper page surface                      |
| foreground | 0.22 0.035 245 | Steel-blue ink for all text                  |
| card       | 1.0 0.003 85   | Raised white panels, tables, admin surfaces  |
| primary    | 0.32 0.06 245  | Deep steel-blue — headers, dark hero panels  |
| accent     | 0.66 0.19 48   | Safety orange — active states, numerals, CTA |
| muted      | 0.945 0.01 85  | Alternating section bands, table zebra       |
| success    | 0.56 0.15 152  | "Tersedia" / stok aman badges                |
| warning    | 0.75 0.15 78   | "Menipis" badges                             |
| destructive| 0.55 0.21 27   | "Habis", uang keluar, destructive actions    |
| hero       | 0.97 0.012 85  | Legible hero body text on the dark steel gradient |
| hero-muted | 0.86 0.02 85   | Secondary hero copy / eyebrow on steel       |
| lab-chasis | 0.52 0.13 245  | Lab 1 Chasis — steel-blue coding             |
| lab-mesin  | 0.66 0.19 48   | Lab 2 Mesin — safety-orange coding           |
| lab-listrik| 0.6 0.11 195   | Lab 3 Kelistrikan — technical teal coding    |

## Typography

- Display: Space Grotesk — hero headline, section headings, nav brand, card titles
- Body: General Sans — paragraphs, labels, table cells, form text
- Mono: JetBrains Mono — rule numerals, stock counts, currency, calendar dates, table numerics
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-base leading-relaxed`

## Elevation & Depth

Flat by default with hairline `border` separators; cards, tables, and org nodes lift using `shadow-subtle`/`shadow-node` at rest and `shadow-elevated` on hover — no glow, no glass.

## Structural Zones

| Zone        | Background               | Border      | Notes                                                       |
| ----------- | ------------------------ | ----------- | ----------------------------------------------------------- |
| Header      | `bg-card`                | `border-b`  | Sticky, logo badge + nav, orange underline on active item   |
| Hero        | `bg-gradient-steel`      | —           | Dark steel panel + `bg-blueprint` grid, `text-hero` body, orange CTA |
| Content     | `bg-background`          | —           | Alternates `bg-background` / `bg-muted/40` per section      |
| Calendar    | `bg-card`                | `border`    | 7-col grid, per-lab event chips, `calendar-today` ring      |
| Org chart   | `bg-background`          | —           | Tiered `org-node` cards joined by `connector-line` hairlines |
| News grid   | `bg-muted/40`            | —           | 3-col `news-thumb` cards, source badge, mono date           |
| Photo band  | image + `bg-band-overlay`| —           | Full-bleed decorative band with caption on steel overlay    |
| Footer      | `bg-primary`             | `border-t`  | Dark steel, department + school identity, small mono meta   |
| Admin       | `bg-card` + sidebar      | `border-r`  | Sidebar uses `sidebar-*` tokens, dense data tables          |

## Spacing & Rhythm

Sections separated by `py-12 md:py-20`; content grouped in cards with `p-5 md:p-6` and `gap-6`; micro-spacing `gap-2`/`gap-3` inside rows and badges; calendar cells `min-h-24 p-2`, org tiers `gap-6 md:gap-10`.

## Component Patterns

- Buttons: 6px radius, `bg-primary` and `bg-accent` variants, subtle lift on hover, no pill shapes
- Cards: 6px radius, `bg-card`, hairline border, `shadow-subtle` → `shadow-elevated` on hover
- Badges: small 4px radius, tinted `success`/`warning`/`destructive` backgrounds, uppercase 11px label
- Calendar chips: 3px radius `event-chip`, tinted `lab-*-soft` bg with `lab-*` text per lab
- Org nodes: `org-node` with steel `org-node-head` bar + paper name body, `shadow-node`
- News cards: `news-thumb` square image, `lab-listrik`/`accent` source badge, mono date footer
- Forms: single-column on mobile, `gap-4`, visible labels above inputs, `border-input` focus ring
- Tables: zebra `bg-muted/40`, sticky mono header row, right-aligned numerics, horizontal scroll on mobile
- Rule lists: oversized mono numerals in orange, hairline dividers, `leading-relaxed` body

## Motion

- Entrance: `animate-rise` 0.5s on hero and section blocks, staggered by 60ms
- Hover: `transition-smooth` 300ms on cards, rows, calendar cells, and buttons; nav underline via `animate-underline-in`
- Decorative: `animate-pulse-soft` only on live stock-status dots; no ambient orbs or gradients

## Constraints

- Bahasa Indonesia for all interface copy
- Hero body text must use `text-hero`/`text-hero-muted` — never `text-foreground` on the dark steel gradient
- Lab coding is fixed: Chasis = steel-blue, Mesin = orange, Kelistrikan = teal
- Financial data surfaces only inside the authenticated admin area
- Mobile-first: tables scroll horizontally, nav collapses to a sheet, calendar and org chart stack vertically
- Never use raw hex/rgb or arbitrary color classes — semantic tokens only

## Signature Detail

The orange tabular rule numeral — a monospace figure with a thin orange rule beside each numbered item — turns tata tertib and every data table into the site's recognizable visual signature; the three-color lab calendar extends it into a weekly workshop rhythm.
