# @acrolinx/sidebar-startpage

A container component for Acrolinx integrations that loads the Acrolinx sidebar.

## Important Npm Development Scripts

* lessWatch - watches for less change in folder src/styles and compiles it to app/styles/index.css
* tscWatch - watches for typescript change in folder src and compiles it to js modules
* watchify - concatenates the javascript modules to a single js file
* browsersync - starts a webserver which serves the sidebar startpage at http://localhost:3000/app/
* dev - starts lessWatch, tscWatch, watchify and browsersync in parallel

To run an example application, using the current startpage, open http://localhost:3000/examples/ .
Port 3000 is the just default port and the used port might differ, if the port 3000 is already used on your system.

## Run the browser-tests in a real browser

    npm run tscWatch
    npm run watchifyTest
    npm run browsersync

Open http://localhost:3000/test/browser-tests/ in your browser.

## Release a new version

 * Increment the version in package.json
 * Commit and push the change.
 * Tag the commit: `git tag vx.x.xx` and push it `git push --tags`. The version should match the one in package.json


## License

Copyright 2017-present Acrolinx GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

For more information visit: http://www.acrolinx.com
