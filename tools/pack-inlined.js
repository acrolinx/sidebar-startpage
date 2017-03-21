const fs = require('fs');

function escapeClosingScriptTag(html) {
  return html.replace('</script>', '<\\/script>');
}

const IMPORT_FONTS_HTML = "<style>@import url('https://fonts.googleapis.com/css?family=Roboto');</style>";

const fileContent = fs.readFileSync('tmp/dist-inlined.html', 'utf-8');
const fileContentWithFonts = fileContent.replace('§INCLUDE_FONTS', IMPORT_FONTS_HTML);
console.log("var ACROLINX_SERVER_SELECTOR_INLINED = " + escapeClosingScriptTag(JSON.stringify(fileContentWithFonts)) + ";");
