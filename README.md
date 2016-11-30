# htw-citeplag-node
Node.js API to support rendering of (merged) abstract-syntax-trees

## Setup

This project relies on the new package manager for node called **Yarn**.
To get started install **Yarn** globally via npm:

- `npm install -g yarn`

To install all dependencies, head to project root and simply run: `yarn`
Now you can run the server with `yarn start`

## Debugging

To debug the app using ChromeDevTools, run `yarn run debug` and then copy the link into a browser.

## Modules

There's a bunch of modules within the **lib** directory we wrote ourselves in order to maintain a clean project structure.

To avoid weird relative paths like `../../../lib/logger` we placed a symlink into node_modules pointing to project root as `app`.
In order to require anything with a path starting relatively at project root simply prepend `app` to the path. e.g `require('app/lib/logger')`
