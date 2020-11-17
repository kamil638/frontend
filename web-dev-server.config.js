const path = require("path");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const babel = require("rollup-plugin-babel");
const replace = require("@rollup/plugin-replace");
const visualizer = require("rollup-plugin-visualizer");
const { string } = require("rollup-plugin-string");
const { terser } = require("rollup-plugin-terser");
const manifest = require("./build-scripts/rollup-plugins/manifest-plugin");
const worker = require("./build-scripts/rollup-plugins/worker-plugin");
const ignore = require("./build-scripts/rollup-plugins/ignore-plugin");
const cors = require("@koa/cors");
const fromRollup = require("@web/dev-server-rollup").fromRollup;

const bundle = require("./build-scripts/bundle");
const paths = require("./build-scripts/paths");
const publicPath = "/frontend_latest/";

const latestBuild = true;
const extensions = [".js", ".ts"];
const isProdBuild = false;
const defineOverlay = {};

const esbuildPlugin = require("@web/dev-server-esbuild").esbuildPlugin;

const SEARCH_REPLACE = bundle.definedVars({
  isProdBuild,
  latestBuild,
  defineOverlay,
});
SEARCH_REPLACE["module.exports ="] = "export default";
// These are dynamic imports which paths are not getting resolved
SEARCH_REPLACE["web-animations-js/web-animations-next-lite.min"] =
  "/node_modules/web-animations-js/web-animations-next-lite.min.js";
SEARCH_REPLACE["../panels/lovelace/ha-panel-lovelace"] =
  "/src/panels/lovelace/ha-panel-lovelace.ts";
SEARCH_REPLACE["../dialogs/more-info/ha-more-info-dialog"] =
  "/src/dialogs/more-info/ha-more-info-dialog.ts";
SEARCH_REPLACE["../components/ha-sidebar"] = "/src/components/ha-sidebar.ts";
SEARCH_REPLACE["../managers/notification-manager"] =
  "/src/managers/notification-manager.ts";

const BODY_OVERRIDE = {
  "/src/resources/compatibility.ts": "",
  "/node_modules/@formatjs/intl-pluralrules/should-polyfill.js":
    "export const shouldPolyfill = () => false",
};

/** @type import("@web/dev-server/src/config/DevServerConfig.ts") */
module.exports = {
  nodeResolve: true,
  middleware: [
    cors(),

    // Without ESBuild plugin, we need to fix the mimetype.
    // async (ctx, next) => {
    //   await next();
    //   if (ctx.type === "video/mp2t") {
    //     ctx.type = "application/javascript";
    //   }
    // },
  ],
  // appIndex: 'demo/index.html'
  // in a monorepo you need to set set the root dir to resolve modules
  // rootDir: '../../',
  plugins: [
    esbuildPlugin({
      ts: true,
      target: "auto",
      json: true,
    }),
    {
      transform(ctx) {
        // Do transforms that normally Rollup would do
        // SUPER UGLY (but it works!)

        // Should be ignored
        if (ctx.request.url in BODY_OVERRIDE) {
          ctx.body = BODY_OVERRIDE[ctx.request.url];
          return;
        }

        // Convert CSS files to export default
        if (ctx.request.url.endsWith(".css")) {
          ctx.body = "export default `" + ctx.body.replace(/`/g, "\\`") + "`";
          ctx.type = "application/javascript";
          return;
        }

        // // Convert to a default export
        // if (ctx.body.startsWith("module.exports =")) {
        //   ctx.body = ctx.body.replace("module.exports =", "export default");
        // }

        // Handle defines because Rollup doesn't work
        Object.entries(SEARCH_REPLACE).forEach(([search, replace]) => {
          ctx.body = ctx.body.replace(new RegExp(search, "g"), replace);
        });
      },
    },
    // Rollup plugins are not working :(
    // These configs are copy pasted from build-scripts/rollup.js
    // fromRollup(ignore)({
    //   files: bundle.emptyPackages({ latestBuild }),
    // }),
    // fromRollup(resolve)({
    //   extensions,
    //   preferBuiltins: false,
    //   browser: true,
    //   rootDir: paths.polymer_dir,
    // }),
    // fromRollup(commonjs)({
    //   namedExports: {
    //     "js-yaml": ["safeDump", "safeLoad"],
    //   },
    // }),
    // fromRollup(json)(),
    // fromRollup(babel)({
    //   ...bundle.babelOptions({ latestBuild }),
    //   extensions,
    //   exclude: bundle.babelExclude(),
    // }),
    // fromRollup(string)({
    //   // Import certain extensions as strings
    //   include: [path.join(paths.polymer_dir, "node_modules/**/*.css")],
    // }),
    // fromRollup(replace)(
    //   bundle.definedVars({ isProdBuild, latestBuild, defineOverlay })
    // ),
    // fromRollup(manifest)({
    //   publicPath,
    // }),
    // fromRollup(worker)(),
  ],
};
