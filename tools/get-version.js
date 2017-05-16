const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json'));
const version = packageJson.version;

console.log(version);