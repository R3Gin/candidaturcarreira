import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  CtaFinal,
  Depoimentos,
  EmpresasMarquee,
  Faq,
  Jornada,
  Numeros,
  Showcase,
} from "@/components/site/HomeSections";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdSlotAuto } from "@/components/ads/AdSlotAuto";

const title = "Candidatu | Recrutamento com IA, vagas e freelas";
const description =
  "Plataforma de recrutamento e seleção do Candidatu: triagem com IA, pipeline kanban, chat com candidatos, currículo gerado em segundos e vagas com salário aberto.";

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
      <EmpresasMarquee />
      <AdSlot className="py-8" slot="1111111111" />
      <Numeros />
      <Showcase />
      <AdSlot className="py-8" slot="2222222222" />
      <Jornada />
      <Depoimentos />
      <Faq />
      <CtaFinal />
      <AdSlot className="pb-8" slot="3333333333" />
      <AdSlotAuto className="pb-12" />
      <SiteFooter />
    </main>
  );
}
