import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Vagas, Empresas, Processo, Empregadores } from "@/components/site/Sections";

const title = "Candidatu | Vagas com salário e etapas à vista";
const description =
  "Encontre vagas no Candidatu com faixa salarial aberta, avaliações de quem trabalha lá e acompanhamento de cada etapa da sua candidatura.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <AdSlot className="py-8" slot="1111111111" />
      <Vagas />
      <Empresas />
      <AdSlot className="py-8" slot="2222222222" />
      <Processo />
      <Empregadores />
      <AdSlot className="pb-12" slot="3333333333" />
      <SiteFooter />
    </main>
  );
}
