const fs = require('fs');

function escapeClosingScriptTag(html) {
  return html.replace('</script>', '<\\/script>');
}

const fileContent = fs.readFileSync('tmp/dist-inlined.html', 'utf-8');

// If you change this variable name, you might also want to change dist/index.d.ts.
console.log("export var ACROLINX_STARTPAGE_INLINED_HTML = " + escapeClosingScriptTag(JSON.stringify(fileContent)) + ";");
