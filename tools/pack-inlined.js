import { readFileSync } from 'fs';

const escapeClosingScriptTag = html => html.replace('</script>', '<\\/script>');

const fileContent = readFileSync('dist/dist-inline/index.html', 'utf-8');

// If you change this variable name, you might also want to change dist/index.d.ts.
console.log(`export const ACROLINX_STARTPAGE_INLINED_HTML = ${escapeClosingScriptTag(JSON.stringify(fileContent))};`);
