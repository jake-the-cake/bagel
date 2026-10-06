import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["client/base/index.jsx"],
  bundle: true,
  outfile: "public/app/base.js",
  format: "iife",
  platform: "browser",
});
