export const SITE_ORIGIN = "https://diagrflow.com";

export type RouteMeta = {
  title: string;
  description: string;
  canonical: string;
  ogUrl: string;
};

/** Homepage meta description. Cafe limit is 160 characters. */
export const HOME_DESCRIPTION =
  "Create a PRISMA flow diagram from systematic-review counts. Preview official PRISMA 2020 boxes and export SVG or PNG with no watermark.";

export const PRICING_DESCRIPTION =
  "Diagrflow is free during the MVP. Open the editor and export PRISMA 2020 flow diagrams as SVG or PNG. No account and no payment form.";

export const EDITOR_DESCRIPTION =
  "Type systematic-review counts and export a PRISMA 2020 flow diagram as SVG or PNG. No watermark. Cite Page et al., BMJ 2021;372:n71.";

export const HOME_META: RouteMeta = {
  title: "Create a PRISMA 2020 flow diagram — Diagrflow",
  description: HOME_DESCRIPTION,
  canonical: `${SITE_ORIGIN}/`,
  ogUrl: `${SITE_ORIGIN}/`,
};

export const PRICING_META: RouteMeta = {
  title: "Pricing — Diagrflow",
  description: PRICING_DESCRIPTION,
  canonical: `${SITE_ORIGIN}/pricing`,
  ogUrl: `${SITE_ORIGIN}/pricing`,
};

export const EDITOR_META: RouteMeta = {
  title: "PRISMA 2020 editor — Diagrflow",
  description: EDITOR_DESCRIPTION,
  canonical: `${SITE_ORIGIN}/editor`,
  ogUrl: `${SITE_ORIGIN}/editor`,
};

export const PRERENDER_ROUTES = ["/", "/pricing", "/editor"] as const;

export function getRouteMeta(url: string): RouteMeta {
  const path = (url.split("?")[0] ?? url).replace(/\/+$/, "") || "/";
  if (path === "/pricing") return PRICING_META;
  if (path === "/editor") return EDITOR_META;
  return HOME_META;
}
