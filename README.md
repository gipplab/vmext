# htw-citeplag-node
Node.js API to support rendering of (merged) abstract-syntax-trees

## Setup

You could use use native npm with `npm i && npm start` although we recommend using **YARN** since it speeds up the installation and deployment processes, saves up disk space due to removing any duplicated packages and locks down all package dependencies (all of them - not only the top level ones as pure npm would do). For further info see [YARN](https://www.npmjs.com/package/yarn)

To install **Yarn** follow the [Installation Guide](https://yarnpkg.com/en/docs/install#mac-tab) for your platform.

To install all dependencies, head to project root and simply run: `yarn`

Now you can run the server with `yarn start`

## Debugging

To debug the app using ChromeDevTools, run `yarn run debug` and then copy the link into a browser.

## Modules

There's a bunch of modules within the **lib** directory we wrote ourselves in order to maintain a clean project structure.

To avoid weird relative paths like `../../../lib/logger` we are using the [app-module-path](https://www.npmjs.com/package/app-module-path) package. This adds the project root directory to the require call. So even in a deeply nested directory you can require any module with a path starting relative to project root e.g `require('lib/logger')`

## Deploying

This project uses [Capistrano](http://capistranorb.com/) for deployments.
To deploy (the master branch) type `cap production deploy`.
For a simple rollback `cap production deploy:rollback`
