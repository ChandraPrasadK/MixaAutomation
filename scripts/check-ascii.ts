import * as fs from 'fs';
import * as path from 'path';

/**
 * Standards check: source files must contain plain ASCII only (no emojis, smileys,
 * decorative symbols or curly quotes), including comments.
 *
 * A line may opt out only when the site itself renders the character and a test must match it.
 * Mark the line with:  // ascii-ok: <reason>
 *
 * Usage: npm run check:ascii
 * Prints file, line and code point only. Exits with code 1 when violations are found.
 */
const ROOTS = ['components', 'pages', 'tests', 'utils', 'fixtures', 'integrations', 'scripts'];
const EXTRA_FILES = ['playwright.config.ts'];
const NON_ASCII = /[^\t\n\r\x20-\x7E]/;
const OPT_OUT = /ascii-ok:\s*\S+/;

function collect(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') collect(full, out);
    } else if (entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
}

function main(): void {
  const files: string[] = [];
  ROOTS.forEach((root) => collect(root, files));
  EXTRA_FILES.filter((f) => fs.existsSync(f)).forEach((f) => files.push(f));

  let violations = 0;
  for (const file of files) {
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .forEach((line, index) => {
        const match = line.match(NON_ASCII);
        if (match && !OPT_OUT.test(line)) {
          violations += 1;
          const codePoint = match[0].codePointAt(0)!.toString(16).toUpperCase();
          console.error(`${file}:${index + 1} non-ASCII character U+${codePoint}`);
        }
      });
  }

  if (violations > 0) {
    console.error(`ASCII check FAILED: ${violations} violation(s).`);
    process.exit(1);
  }
  console.log(`ASCII check OK (${files.length} files).`);
}

main();
