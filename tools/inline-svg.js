const fs = require('fs');
const path = require('path')

const BASE_DIR = './tmp/dist-inlined/styles';
const ENCODING = 'utf8';

const files = fs.readdirSync(BASE_DIR);
files.forEach(file => {
  const completeFilePath = path.join(BASE_DIR, file);
  const cssContent = fs.readFileSync(completeFilePath, ENCODING);
  const inlinedCssContent = cssContent.replace(/url\((.*?)\)/, (completeMatch, url) => {
    if (url.endsWith('.svg')) {
      console.log('Inline svg ', url);
      const svgContent = fs.readFileSync(path.join(BASE_DIR, url), 'utf-8');
      return "url('data:image/svg+xml;base64," + new Buffer(svgContent).toString('base64') + "')"
    } else {
      return completeMatch;
    }
  });
  if (inlinedCssContent != cssContent) {
    console.log('Inlined svg in file', completeFilePath);
    fs.writeFileSync(completeFilePath, inlinedCssContent, ENCODING);
  }
});