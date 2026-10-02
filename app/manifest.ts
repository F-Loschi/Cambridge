import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cambridge C1 Prep",
    short_name: "C1 Prep",
    description: "Estudo pessoal para o exame Cambridge C1 Advanced",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6efe4",
    theme_color: "#6c7fb8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
