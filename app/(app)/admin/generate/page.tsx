import { Sparkles } from "lucide-react";
import { GenerateQuestionPanel } from "@/components/GenerateQuestionPanel";

// Reachable only by admins — enforced by proxy.ts; the API route re-checks too.
export default function GenerateQuestionsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-extrabold">
        <Sparkles size={24} className="text-brand" strokeWidth={2.25} />
        Gerar questões
      </h1>
      <p className="mb-6 text-sm text-muted">
        Cada clique roda o pipeline completo: gerador → resolvedor cego → auditor. Itens aprovados
        já ficam disponíveis pra prática; os demais vão pra fila de revisão.
      </p>
      <GenerateQuestionPanel />
    </div>
  );
}
