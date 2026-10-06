# EduVault — Academic & Career Portal

**Live demo:** [kian-drego.github.io/BnB_404-Bus_Not_Found](https://kian-drego.github.io/BnB_404-Bus_Not_Found/) — deployed automatically from `main` via GitHub Actions.

A responsive, **100% free** student-led platform for undergraduates, combining four modules in one calm, pastel workspace:

| Module | What it does |
| --- | --- |
| **A · Past Papers & Question Repository** | Search/filter past exam questions by subject → chapter → topic, year, term and difficulty. Add questions to a **Custom Paper Workspace**, reorder them, and export two client-side PDFs: a branded **Question Paper** (cover page, summary box, instructions) and a matching **Answer Key** (step-by-step solutions). |
| **B · Notes & Content Repository** | Peer-uploaded notes & answer scripts with **up/down voting**, mandatory `Chapter` + `Topic` validation on upload, and **open community moderation** — anyone can contribute (no login) and help verify, flag or remove content. |
| **C · ATS Resume Builder** | Single-column, parser-safe resume editor with live **ATS structural checks**, **keyword-density report** per target role, action-verb guidance, and a clean **ATS-safe PDF export** (Helvetica, no tables/graphics/columns). |
| **D · Scholarship Directory & Tracker** | Government, private, university-aid and **reserved-quota** scholarships with filters (category, region, deadline, award amount), per-scholarship eligibility rules, interactive **document checklists** (Marksheet, Income/Caste Certificate, SOP…), and a personal **application tracker** (Not Started → In Progress → Submitted → Awarded/Rejected). |

## Tech stack

- **Vite 8 + React 19 + TypeScript** (strict: `verbatimModuleSyntax`, `noUnusedLocals`)
- **Tailwind CSS v4** — pastel design tokens (`lavender`, `mint`, `softblue`, `peach`), class-based **dark/light mode** persisted to `localStorage`
- **React Router v7** — clean dynamic routes (`/papers`, `/worksheet`, `/notes`, `/notes/upload`, `/notes/moderation`, `/resume`, `/scholarships`, `/scholarships/:id`, `/tracker`)
- **Zustand + persist** — worksheet cart, votes, uploads, moderation overlays, application tracker, resume draft, theme and role all persist locally (no backend, private by default)
- **jsPDF** — vector PDF generation, lazy-loaded on export so the main bundle stays light
- **lucide-react** icons, **oxlint** for linting

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint       # oxlint
npm run preview    # serve the production build
```

## Project structure

```
src/
├── types/index.ts          # Shared domain models (schema)
├── data/index.ts           # Seed taxonomy, questions, notes, scholarships, ATS keyword bank
├── store/index.ts          # Zustand persisted stores (theme, role, votes, worksheet, notes, tracker)
├── components/
│   ├── ui/                 # Design-system primitives (Button, Card, Badge, Input, Field, …)
│   └── layout/             # App shell: navbar, theme toggle, role switcher, footer
├── modules/
│   ├── papers/             # Module A — repository, question cards, worksheet, PDF generators
│   ├── notes/              # Module B — repository, voting, upload validation, moderation queue
│   ├── resume/             # Module C — builder, ATS checks/keywords, ATS-safe PDF export
│   └── scholarships/       # Module D — directory, detail + checklist, tracker dashboard
└── pages/                  # Home, 404
```

## Notes

- **No login, open contribution:** anyone can upload notes/answer scripts and participate in community moderation (verify / flag / remove) straight from the navbar.
- All data is seed content living in `src/data/index.ts`; user-generated state lives in `localStorage` under `eduvault-*` keys. Clearing site data resets the app.
- The PDF generators sanitise text to cp1252 so math symbols (π, λ, →, …) render correctly with jsPDF's built-in fonts.
