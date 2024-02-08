import { build, emptyDir } from 'dnt';

await emptyDir('./npm');

await build({
  packageManager: 'pnpm',
  compilerOptions: {
    lib: ['ESNEXT', 'DOM'],
  },
  entryPoints: ['offchain/src/mod.ts'],
  outDir: 'npm',
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  skipSourceOutput: true,
  testPattern: 'offchain/src/**/*.test.{ts,tsx,js,mjs,jsx}',
  rootTestDir: 'offchain/src',
  importMap: 'deno.json',
  test: true,
  typeCheck: false,
  scriptModule: false,
  declaration: false,
  mappings: {
    'https://deno.land/x/lucid@0.10.7/mod.ts': {
      name: 'lucid-cardano',
      version: '^0.10.7',
    },
  },
  package: {
    // package.json properties
    name: 'mintun-offchain',
    version: Deno.args[0],
    description: 'The offchain library used for interacting with Mintun contracts',
    repository: {
      type: 'git',
      url: 'git+https://github.com/ikigai-github/mintun',
    },
  },
  postBuild() {
    Deno.copyFileSync('offchain/LICENSE', 'npm/LICENSE');
    Deno.copyFileSync('offchain/README.MD', 'npm/README.MD');
  },
});
