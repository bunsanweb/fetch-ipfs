import nodeBuiltins from "rollup-plugin-node-builtins-brofs";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import banner from "rollup-plugin-banner";

export default [{
  input: "./mime-types-src/entry.js", // `export {default} from "mime-types";`
  output: {
    file: "./modules/mime-types.js",
    format: "esm",  // result is ES module
  },
  plugins: [
    nodeBuiltins(), // for "path" builtin module used in mime-types
    nodeResolve(),  // for resolve "mime-types" as `node_modules/mime-types`
    commonjs(),     // for import mime-types (cjs script)
    json(),         // for import mime-db (json file)

    // Prepend MIT Licenses of dependent packages as JS comment
    banner({file: "./node_modules/mime-db/LICENSE"}),
    banner({file: "./node_modules/mime-types/LICENSE"}),
  ],
}];
