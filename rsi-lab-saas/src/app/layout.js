import './globals.css';
import { Instrument_Sans, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';

/**
 * Self-hosted via next/font rather than <link> tags to fonts.googleapis.com.
 * Three reasons that matter here:
 *   - the stylesheet request is render-blocking and third-party,
 *   - a PWA used in a clinic with poor wifi should not depend on Google being
 *     reachable to render legible text,
 *   - next/font emits a size-adjusted fallback, which removes the layout shift
 *     when the real face swaps in.
 */
const sans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic',
});

export const metadata = {
  title: 'RSI Lab',
  description: 'Markerless single-leg drop jump and hop assessment for physiotherapy clinics.',
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  themeColor: '#0B0B0B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${sans.variable} ${mono.variable} ${arabic.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
