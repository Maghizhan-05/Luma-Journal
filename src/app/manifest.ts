import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — your day, journaled`,
    short_name: APP_NAME,
    description:
      "A playful journaling & productivity space: daily journal, photo wall, key moments, and a financial tracker.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f6f5fb",
    theme_color: "#7c5cff",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
