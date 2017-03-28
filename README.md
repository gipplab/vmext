# VET: A Visualization Tool for  Mathematical Expression Trees

Mathematical expressions can be understood and represented as a tree con-sisting of functions (non-leaf nodes) and their arguments (child nodes of function nodes). Such expression trees are an important concept to store and process mathematical expressions as well as the most frequently used visual-ization of the structure of mathematical expressions. Typically, researchers visualize expression trees using general purpose tools that are not optimized for mathematics. This approach is laborious, redundant if mathematical ex-pressions are available in a structured markup, such as MathML, and error-prone, since the visualization represents a researcher’s notion of what the markup of an expression should be, but not necessarily what the actual markup is. In this paper, we present VET – a tool to automatically visualize mathematical expression trees from parallel MathML. Additionally, we pre-sent a demo application to convert LaTeX input to parallel MathML, which is then visualized using VET. By visualizing the actual markup of mathematical expressions, VET enables content providers to quickly spot problems in the content MathML markup that do not affect the presentation of the expres-sion. Identifying such discrepancies previously required reading the verbose and complex parallel MathML markup. VET also allows to visualize similar and identical elements of two expressions using arbitrary similarity measures. Visualizing expression similarity shall support developers in designing re-trieval approaches and enable improved interaction concepts for users of mathematical information retrieval systems. The similarity visualization al-lows designers and users of such systems to inspect the reasoning of a simi-larity measure, rather than exclusively being provided with a scalar similarity score as is the case for most current retrieval systems.
## Setup

You can use use native npm with `npm i && npm start`.

An alternative is using **YARN** since it speeds up the installation and deployment processes, saves up disk space due to removing any duplicated packages and locks down all package dependencies (all of them - not only the top level ones as pure npm would do). For further info see [YARN](https://www.npmjs.com/package/yarn)

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
