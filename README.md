# VMEXT: A Visualization Tool for  Mathematical Expression Trees

Mathematical expressions can be understood and represented as a tree consisting of functions (non-leaf nodes) and their arguments (child nodes of function nodes). Such expression trees are an important concept to store and process mathematical expressions as well as the most frequently used visualization of the structure of mathematical expressions.

Typically, researchers visualize expression trees with the help of general purpose tools that are not optimized for mathematics.
This approach is laborious, redundant if mathematical expressions are available in a structured markup, such as MathML, and error-prone, since the visualization represents a researcher’s notion of what the markup of an expression should be, but not necessarily what the actual markup is.

VMEXT is a tool to automatically visualize mathematical expression trees from parallel MathML. By visualizing the actual markup of mathematical expressions, VMEXT enables content providers to quickly spot problems in the content MathML markup that do not affect the presentation of the expression. Identifying such discrepancies previously required reading the verbose and complex parallel MathML markup. VMEXT also allows to visualize similar and identical elements of two expressions using arbitrary similarity measures.
Visualizing expression similarity shall support developers in designing retrieval approaches and enable improved interaction concepts for users of mathematical information retrieval systems. The similarity visualization allows designers and users of such systems to inspect the reasoning of a similarity measure, rather than exclusively being provided with a scalar similarity score as is the case for most current retrieval systems.

## Setup

You may install VMEXT using **npm** like so: `npm i && npm start`.

Alternatively, you may use **YARN** which speeds up the installation and deployment processes, saves disk space by removing duplicate packages, and locks all package dependencies - not only the top level dependencies like npm does. For further information, see [YARN](https://www.npmjs.com/package/yarn)

To install **Yarn**, follow the [Installation Guide](https://yarnpkg.com/en/docs/install#mac-tab) for your platform.

To install all dependencies, navigate to the project root and run: `yarn`

After that, you can run the server using `yarn start`

To use use a local mathoid installation install mathoid locally from npm and change the mathoidUrl in the [config](config.ymal).

## Debugging

To debug the app, use ChromeDevTools, run `yarn run debug` and copy the link into a browser.

## Modules

The **lib** directory contains a number of libraries we we developed to maintain a clean project structure.

To avoid long relative paths like `../../../lib/logger`, we use the [app-module-path](https://www.npmjs.com/package/app-module-path) package. The package adds the project's root directory to the require call. This allows you to require any module unsing a path starting relative to the project's root e.g `require('lib/logger')`, eben in deeply nested project structures.

## Deployment

We use [Capistrano](http://capistranorb.com/) for deployment.
To deploy (the master branch) type `cap production deploy`.
For a simple rollback `cap production deploy:rollback`
