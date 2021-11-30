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
