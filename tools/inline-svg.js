/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const path = require('path')

const ENCODING = 'utf8';

const baseDir = process.argv[2];
if (!baseDir) {
  console.error("inline-svg needs a baseDir as argument!");
  process.exit(1);
}

console.log('Inline files in ' + baseDir + ' ...');

const files = fs.readdirSync(baseDir);
files.forEach(file => {
  const completeFilePath = path.join(baseDir, file);
  const cssContent = fs.readFileSync(completeFilePath, ENCODING);
  const inlinedCssContent = cssContent.replace(/url\((.*?)\)/g, (completeMatch, url) => {
    if (url.endsWith('.svg')) {
      console.log('Inline svg ', url);
      const svgContent = fs.readFileSync(path.join(baseDir, url), 'utf-8');
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