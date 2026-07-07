import { CATEGORY_LABEL, STATUS_LABEL, type ArtCandidate } from "./types";

export function toMarkdown(candidates: ArtCandidate[]): string {
  if (candidates.length === 0) {
    return "# Art review\n\nNo candidates recorded yet.\n";
  }

  const lines = ["# Art review", ""];
  for (const candidate of candidates) {
    lines.push(`## ${candidate.title}`);
    lines.push("");
    lines.push(`- Category: ${CATEGORY_LABEL[candidate.category]}`);
    lines.push(`- Status: ${STATUS_LABEL[candidate.status]}`);
    lines.push(`- Priority: ${candidate.priority}/5`);
    if (candidate.imageRef) {
      lines.push(`- Reference: ${candidate.imageRef}`);
    }
    lines.push("");
    if (candidate.notes) {
      lines.push(candidate.notes);
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function toJson(candidates: ArtCandidate[]): string {
  return JSON.stringify(candidates, null, 2);
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
