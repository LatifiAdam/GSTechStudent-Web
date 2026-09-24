import { createFileRoute } from "@tanstack/react-router";
import { StudentPortal } from "@/components/student-portal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GSTechStudent — Portail de formation" },
      { name: "description", content: "Espace numérique de gestion et de suivi de la formation professionnelle." },
      { property: "og:title", content: "GSTechStudent — Portail de formation" },
      { property: "og:description", content: "Espace numérique de gestion et de suivi de la formation professionnelle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <StudentPortal />;
}
