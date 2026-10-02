import { normalizeLine, parseInline } from "@/lib/ui/inlineMarkdown";

/** Renders AI-written text, turning stray markdown (**bold**, *italic*, `code`, bullets) into real formatting. */
export function RichText({ text }: { text: string }) {
  const lines = text.split("\n").map(normalizeLine);

  return (
    <span className="whitespace-pre-line">
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && "\n"}
          {parseInline(line).map((seg, j) => {
            if (seg.type === "bold") return <strong key={j}>{seg.text}</strong>;
            if (seg.type === "italic") return <em key={j}>{seg.text}</em>;
            if (seg.type === "code")
              return (
                <code key={j} className="rounded bg-background px-1 py-0.5 font-mono text-[0.9em]">
                  {seg.text}
                </code>
              );
            return seg.text;
          })}
        </span>
      ))}
    </span>
  );
}
