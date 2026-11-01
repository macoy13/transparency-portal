import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import portal from './portal.config';
import { DEFAULT_API, compactChrome, shortNameOf, showApiLinks, showSourceLinks } from './src/config';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Main's Google Fonts links — emitted when compact is off. */
const MAIN_FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<!-- Figtree speaks (display), Inter works (body), JetBrains Mono labels. -->',
  '<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@600;700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">',
].join('\n    ');

/** Compact: self-hosted font CSS + preloads for the main weights. */
const COMPACT_FONT_LINKS = [
  '<link rel="stylesheet" href="/fonts/compact-fonts.css" />',
  '<link rel="preload" href="/fonts/SourceSans3-Regular.woff2" as="font" type="font/woff2" crossorigin />',
  '<link rel="preload" href="/fonts/Manrope-SemiBold.woff2" as="font" type="font/woff2" crossorigin />',
].join('\n    ');

const MAIN_ICON_LINKS = '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />';

const COMPACT_ICON_LINKS = [
  '<link rel="icon" type="image/svg+xml" href="/brand/iloilo/favicon.svg" />',
  '<link rel="icon" type="image/png" sizes="32x32" href="/brand/iloilo/favicon-32.png" />',
  '<link rel="shortcut icon" href="/brand/iloilo/favicon.ico" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/brand/iloilo/apple-touch-icon.png" />',
].join('\n    ');

/** The portal's name and description in the HTML itself, for link previews and search engines. */
function portalHtml(api: string): Plugin {
  const title = `${portal.name} · FY 2027 budget projects`;
  const description = `Every FY 2027 project for ${shortNameOf(portal)} in the NEP and the House bill (House Bill 10858), with the source page for each, and the enacted budgets 2020–2026. Data from the BetterGov.ph Budget API.`;
  const url = portal.siteUrl
    ? `<link rel="canonical" href="${escape(portal.siteUrl)}" />\n    <meta property="og:url" content="${escape(portal.siteUrl)}" />`
    : '';
  const compact = compactChrome(portal);
  const fontLinks = compact ? COMPACT_FONT_LINKS : MAIN_FONT_LINKS;
  const iconLinks = compact ? COMPACT_ICON_LINKS : MAIN_ICON_LINKS;
  const themeColor = compact ? '#3659b8' : '#0b4fd9';
  return {
    name: 'portal-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let out = html
          .replaceAll('%PORTAL_TITLE%', escape(title))
          .replaceAll('%PORTAL_NAME%', escape(portal.name))
          .replaceAll('%PORTAL_DESCRIPTION%', escape(description))
          .replaceAll('%PORTAL_API%', escape(api))
          .replaceAll('%PORTAL_URL_META%', url)
          .replaceAll('%PORTAL_FONT_LINKS%', fontLinks)
          .replaceAll('%PORTAL_ICON_LINKS%', iconLinks)
          .replaceAll('%PORTAL_THEME_COLOR%', themeColor);
        // So compact tokens apply on first paint (no useEffect flash).
        if (compact) out = out.replace('<html lang="en">', '<html lang="en" data-chrome="compact">');
        return out;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const api = (env.VITE_API_BASE || portal.api || DEFAULT_API).replace(/\/+$/, '');
  return {
    define: {
      // Literals, so a build that turns these off drops the hrefs entirely.
      __CHROME_SOURCE_LINKS__: JSON.stringify(showSourceLinks(portal)),
      __CHROME_API_LINKS__: JSON.stringify(showApiLinks(portal)),
    },
    plugins: [react(), portalHtml(api)],
    server: {
      host: '0.0.0.0',
      // Reserved in ~/projects/ports.md (transparency-portal). strictPort so a
      // collision fails loudly instead of moving the URL.
      port: 5132,
      strictPort: true,
      allowedHosts: ['dev.neonplayground.com'],
    },
    preview: { host: '0.0.0.0', port: 5132, strictPort: true },
  };
});
