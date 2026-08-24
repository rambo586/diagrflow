# Diagrflow

Diagrflow is a focused web tool for journal-ready **PRISMA 2020 flow diagrams** used in systematic reviews. Type identification, screening, eligibility, and included counts; the diagram updates; export SVG or PNG with no watermark.

- Brand: **Diagrflow**
- Domain: **diagrflow.com** (canonical `https://diagrflow.com`)
- Task: create a PRISMA 2020 flow diagram

This is not a general graphical-abstract suite. Diagrflow is not affiliated with prisma-statement.org. Cite the PRISMA 2020 statement when you use a figure:

Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. *BMJ*. 2021;372:n71. doi:10.1136/bmj.n71

Authors may use exported figures in journal submissions. Keep the PRISMA 2020 citation in the figure legend.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

- Home: `/`
- Editor: `/editor`
- Sample diagram: `/editor?sample=1`
- Pricing: `/pricing` (free MVP; no payments)

```bash
npm test
npm run build
```

`npm test` checks official box labels, count arithmetic, and layout data. `npm run build` type-checks and produces `dist/` for static hosting.

## What the editor implements

Official PRISMA 2020 new-review boxes:

- Records identified from databases and registers
- Records removed before screening
- Records screened / records excluded
- Reports sought for retrieval / reports not retrieved
- Reports assessed for eligibility / reports excluded with reasons
- Studies included in review / reports of included studies

Optional second column: identification via other methods (websites, organisations, citation searching). Grey-box lines that do not apply can be hidden rather than zeroed.

## Licence note

PRISMA 2020 flow-diagram templates are distributed under CC BY 4.0. Diagrflow adapts that structure and cites Page et al., BMJ 2021;372:n71.
