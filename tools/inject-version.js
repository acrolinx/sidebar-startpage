const fs = require('fs');

const CONSTANTS_FILE = 'tmp/compiled/src/constants.js';
const ENCODING = 'utf8';

const packageJson = JSON.parse(fs.readFileSync('package.json'));
const build = process.env.BUILD_NUMBER || 1;

const serverSelectorVersion = packageJson.version + '.' + build;

// Replace in constants.js file
const fileContent = fs.readFileSync(CONSTANTS_FILE, ENCODING);
const modifiedFileContent = fileContent.replace('§SERVER_SELECTOR_VERSION', serverSelectorVersion);
if (fileContent === modifiedFileContent) {
  console.error("Can't find §SERVER_SELECTOR_VERSION in " + CONSTANTS_FILE);
  process.exit(1);
}

fs.writeFileSync(CONSTANTS_FILE, modifiedFileContent, ENCODING);


// Write version file into app folder
fs.writeFileSync('app/version.properties', 'version=' + serverSelectorVersion, ENCODING);