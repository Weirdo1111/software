import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "English Learn MVP",
    short_name: "ELearn",
    description: "AI-assisted English learning for non-native speakers",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f0e9",
    theme_color: "#111111",
    icons: [
      {
        src: "/next.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
