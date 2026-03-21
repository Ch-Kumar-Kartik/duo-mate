import { parse } from "node-html-parser";

export function cleanEmailBody(
  bodyPlain: string | null,
  bodyHtml: string | null
): string {
  let text = "";

  if (bodyPlain) {
    text = bodyPlain;
  } else if (bodyHtml) {
    const root = parse(bodyHtml);
    root.querySelectorAll("style, script").forEach((el) => el.remove());
    text = root.structuredText;
  }

  if (!text) return "";

  // Strip quoted reply lines (lines starting with >)
  text = text
    .split("\n")
    .filter((line) => !line.trimStart().startsWith(">"))
    .join("\n");

  // Strip email signatures (everything after a standalone "-- " or "--")
  const sigIndex = text.search(/^\s*--\s*$/m);
  if (sigIndex !== -1) {
    text = text.slice(0, sigIndex);
  }

  // Collapse whitespace: multiple blank lines → single, trim each line
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}
