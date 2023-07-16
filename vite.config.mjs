import { svelte } from "@sveltejs/vite-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve"; // This resolves NPM modules from node_modules.
import preprocess from "svelte-preprocess";
import {
  postcssConfig,
  terserConfig,
  typhonjsRuntime
} from '@typhonjs-fvtt/runtime/rollup';
//import { viteZip } from 'vite-plugin-zip-file';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import cleanPlugin from 'vite-plugin-clean';
import { normalizePath } from 'vite';
import path from 'path';
import { run } from 'vite-plugin-run'
// import sassDts from 'vite-plugin-sass-dts'
// import vue from '@vitejs/plugin-vue'
// import laravel from "laravel-vite-plugin";

// ATTENTION!
// Please modify the below variables: s_PACKAGE_ID and s_SVELTE_HASH_ID appropriately.

// For convenience, you just need to modify the package ID below as it is used to fill in default proxy settings for
// the dev server.
const s_MODULE_ID = "Border-Control";
const s_PACKAGE_ID = "modules/"+s_MODULE_ID;
const s_ENTRY_JAVASCRIPT = "module.js";

// A short additional string to add to Svelte CSS hash values to make yours unique. This reduces the amount of
// duplicated framework CSS overlap between many TRL packages enabled on Foundry VTT at the same time. 'ese' is chosen
// by shortening 'essential-svelte-esm'.
const s_SVELTE_HASH_ID = "ese";

const s_COMPRESS = false; // Set to true to compress the module bundle.
const s_SOURCEMAPS = true; // Generate sourcemaps for the bundle (recommended).

// EXPERIMENTAL: Set to true to enable linking against the TyphonJS Runtime Library module.
// You must add a Foundry module dependency on the `typhonjs` Foundry package or manually install it in Foundry from:
// https://github.com/typhonjs-fvtt-lib/typhonjs/releases/latest/download/module.json
const s_TYPHONJS_MODULE_LIB = false;

// Used in bundling particularly during development. If you npm-link packages to your project add them here.
const s_RESOLVE_CONFIG = {
  browser: true,
  dedupe: ["svelte"],
};

// ATTENTION!
// You must change `base` and the `proxy` strings replacing `/modules/${s_MODULE_ID}/` with your
// module or system ID.

export default () => {
  /** @type {import('vite').UserConfig} */
  return {
    root: "src/", // Source location / esbuild root.
    base: `/${s_PACKAGE_ID}/`, // Base module path that 30001 / served dev directory.
    publicDir: false, // No public resources to copy.
    cacheDir: "../.vite-cache", // Relative from root directory.

    resolve: { conditions: ["import", "browser"] },

    esbuild: {
      target: ['es2022', 'chrome100'],
      keepNames: true   // Note: doesn't seem to work.
    },

    css: {
      // Creates a standard configuration for PostCSS with autoprefixer & postcss-preset-env.
      postcss: postcssConfig({ compress: s_COMPRESS, sourceMap: s_SOURCEMAPS }),
    },

    // About server options:
    // - Set to `open` to boolean `false` to not open a browser window automatically. This is useful if you set up a
    // debugger instance in your IDE and launch it with the URL: 'http://localhost:30001/game'.
    //
    // - The top proxy entry redirects requests under the module path for `style.css` and following standard static
    // directories: `assets`, `lang`, and `packs` and will pull those resources from the main Foundry / 30000 server.
    // This is necessary to reference the dev resources as the root is `/src` and there is no public / static
    // resources served with this particular Vite configuration. Modify the proxy rule as necessary for your
    // static resources / project.
    server: {
      port: 29999,
      open: "/game",
      // open: false,
      proxy: {
        // Serves static files from main Foundry server.
        [`^(/${s_PACKAGE_ID}/(fonts|assets|lang|languages|packs|styles|templates|style.css))`]:
          "http://127.0.0.1:30000",

        // All other paths besides package ID path are served from main Foundry server.
        [`^(?!/${s_PACKAGE_ID}/)`]: "http://127.0.0.1:30000",

        // Enable socket.io from main Foundry server.
        "/socket.io": { target: "ws://127.0.0.1:30000", ws: true },
      },
    },
    
    build: {
      outDir: normalizePath( path.resolve(__dirname, `./dist/${s_MODULE_ID}`)), // __dirname,
      emptyOutDir: false,
      sourcemap: s_SOURCEMAPS,
      brotliSize: true,
      minify: s_COMPRESS ? "terser" : false,
      target: ['es2022', 'chrome100'],
      terserOptions: s_COMPRESS ? { ...terserConfig(), ecma: 2022 } : void 0,
      lib: {
        entry: "./" + s_ENTRY_JAVASCRIPT, // "./module.js"
        formats: ["es"],
        fileName: "module",
      },
    },
    
    plugins: [
      //   vue(),
      //   hbsPlugin(),
      //   translationPlugin('./src/lang', './dist/lang'),
      run([
        {
          name: 'run sass',
          run: ['sass',  `src/styles:dist/${s_MODULE_ID}/styles`]
        },
      ]),
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.resolve(__dirname, './src/assets')) + '/[!.]*', // 1️
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/assets`)), // 2️
          },
          {
            src: normalizePath(path.resolve(__dirname, './src/images')) + '/[!.]*', // 1️
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/images`)), // 2️
          },
          {
            src: normalizePath(path.resolve(__dirname, './src/icons')) + '/[!.]*', // 1️
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/icons`)), // 2️
          },
          {
            src: normalizePath(path.resolve(__dirname, './src/templates')) + '/[!.]*', // 1️
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/templates`)), // 2️
          },
          {
            src: normalizePath(path.resolve(__dirname, './src/lang')) + '/[!.]*',
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/lang`)),
          },
          {
            src: normalizePath(path.resolve(__dirname, './src/languages')) + '/[!.]*',
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/languages`)),
          },
          // {
          //   src: normalizePath(path.resolve(__dirname, './src/styles')) + '/[!.]/**/*',
          //   dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/styles`)),
          // },
          {
            src: normalizePath(path.resolve(__dirname, './src/packs')) + '/[!.]*',
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/packs`)),
          },
          {
            src: normalizePath(path.resolve(__dirname, './src/module.json')),
            dest: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}/`)),
          },
        ],
      }),
      svelte({
        //compilerOptions: {
        //  // Provides a custom hash adding the string defined in `s_SVELTE_HASH_ID` to scoped Svelte styles;
        //  // This is reasonable to do as the framework styles in TRL compiled across `n` different packages will
        //  // be the same. Slightly modifying the hash ensures that your package has uniquely scoped styles for all
        //  // TRL components and makes it easier to review styles in the browser debugger.
        //  cssHash: ({ hash, css }) => `svelte-${s_SVELTE_HASH_ID}-${hash(css)}`,
        //},
        preprocess: preprocess(),
        onwarn: (warning, handler) => {
          // Suppress `a11y-missing-attribute` for missing href in <a> links.
          // Foundry doesn't follow accessibility rules.
          if (warning.message.includes(`<a> element should have an href attribute`)) {
            return;
          }
          
          // Let Rollup handle all other warnings normally.
          handler(warning);
        },
      }),

      resolve(s_RESOLVE_CONFIG), // Necessary when bundling npm-linked packages.
      
      // When s_TYPHONJS_MODULE_LIB is true transpile against the Foundry module version of TRL.
      s_TYPHONJS_MODULE_LIB && typhonjsRuntime(),

      // viteZip({
      //   folderPath: normalizePath(path.resolve(__dirname, `./dist/${s_MODULE_ID}`)),
      //   outPath: normalizePath(path.resolve(__dirname, './package')),
      //   zipName: 'module.zip',
      //   enabled: true
      // }),
      cleanPlugin()
    ]
  };
};

