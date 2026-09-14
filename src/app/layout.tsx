import type { Metadata, Viewport } from "next";
import { Space_Mono, Courier_Prime } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Typewriter display face — geometric mono with real character.
const spaceMono = Space_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Courier Prime — a screen-optimized typewriter face for readable body text.
const courierPrime = Courier_Prime({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const APP_NAME = "LUMA";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — your day's diary`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "LUMA is your day's diary: a warm space for your journal, photos, key moments and money — with weekly, monthly and yearly views.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceMono.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
