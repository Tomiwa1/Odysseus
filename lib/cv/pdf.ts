/* Read the text out of a PDF, with no dependency.
 *
 * A PDF is objects in a container. Page text lives in content streams,
 * usually Flate compressed, as Tj and TJ show-text operators. Node has
 * zlib, so the whole thing is a parser rather than a library.
 *
 * This reads text. It does not lay out pages, handle encrypted files,
 * read scans, or do OCR. Those fail loudly and the caller says so,
 * because a CV that half parsed is worse than one that did not: the
 * product would then claim facts the document never contained.
 */
import { inflateSync, inflateRawSync } from "node:zlib";

const STREAM = /stream\r?\n?([\s\S]*?)\r?\n?endstream/g;

function inflate(buf: Buffer): string | null {
  for (const fn of [inflateSync, inflateRawSync]) {
    try { return fn(buf).toString("latin1"); } catch { /* try the other */ }
  }
  return null;
}

/* PDF strings escape their delimiters, and octal escapes are common in
   anything non-ASCII. */
function unescapePdf(s: string): string {
  return s
    .replace(/\\([0-7]{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
    .replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t")
    .replace(/\\([()\\])/g, "$1");
}

/* Tj draws one string. TJ draws an array of strings and kerning numbers,
   where a number below about -100 is a wide enough gap to be a space. */
function textFromStream(content: string): string {
  const out: string[] = [];

  for (const m of content.matchAll(/\[((?:[^\][\\]|\\.)*)\]\s*TJ/g)) {
    let line = "";
    for (const part of m[1].matchAll(/\(((?:[^()\\]|\\.)*)\)|(-?[\d.]+)/g)) {
      if (part[1] !== undefined) line += unescapePdf(part[1]);
      else if (Number(part[2]) < -100) line += " ";
    }
    if (line.trim()) out.push(line);
  }

  for (const m of content.matchAll(/\((?:[^()\\]|\\.)*\)\s*Tj/g)) {
    const inner = m[0].slice(1, m[0].lastIndexOf(")"));
    const t = unescapePdf(inner);
    if (t.trim()) out.push(t);
  }

  /* a new line of type is a new line of text */
  return out.join("\n").replace(/[ \t]{2,}/g, " ");
}

export type PdfRead =
  | { ok: true; text: string; chars: number }
  | { ok: false; why: string };

export function readPdf(bytes: Buffer): PdfRead {
  const raw = bytes.toString("latin1");

  if (!raw.startsWith("%PDF")) return { ok: false, why: "That file is not a PDF." };
  if (/\/Encrypt\b/.test(raw)) {
    return { ok: false, why: "That PDF is password protected, so nothing can be read from it." };
  }

  const pieces: string[] = [];
  for (const m of raw.matchAll(STREAM)) {
    const body = Buffer.from(m[1], "latin1");
    const text = inflate(body) ?? (/[\x00-\x08\x0e-\x1f]/.test(m[1]) ? null : m[1]);
    if (text && /(Tj|TJ)\b/.test(text)) pieces.push(textFromStream(text));
  }

  const text = pieces.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  /* A scan is a PDF full of images and no show-text operators. Saying so
     is the honest answer; inventing a profile from nothing is not. */
  if (text.length < 200) {
    return {
      ok: false,
      why:
        "No text could be read from that PDF. If it is a scan or an export of " +
        "images, the words are pictures, and nothing in it can be read.",
    };
  }

  return { ok: true, text, chars: text.length };
}
