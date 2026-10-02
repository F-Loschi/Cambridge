export type Segment = { type: "text" | "bold" | "italic" | "code"; text: string };

// Models keep emitting markdown even when told not to, so AI text is
// rendered through this instead of showing raw asterisks.
const TOKEN = /\*\*([^*]+)\*\*|\*([^*\s][^*]*?)\*|`([^`]+)`/g;

/** Splits a single line into plain / bold / italic / code segments. */
export function parseInline(line: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;

  for (const match of line.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ type: "text", text: line.slice(last, index) });
    if (match[1] !== undefined) segments.push({ type: "bold", text: match[1] });
    else if (match[2] !== undefined) segments.push({ type: "italic", text: match[2] });
    else segments.push({ type: "code", text: match[3] });
    last = index + match[0].length;
  }
  if (last < line.length) segments.push({ type: "text", text: line.slice(last) });
  return segments;
}

/** Drops heading hashes and turns "* item" / "- item" bullets into "• item". */
export function normalizeLine(line: string): string {
  return line.replace(/^\s*#{1,6}\s+/, "").replace(/^\s*[*-]\s+/, "• ");
}
