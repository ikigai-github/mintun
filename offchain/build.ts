import { build, emptyDir } from 'dnt';

await emptyDir('./npm');

await build({
  entryPoints: ['./src/mod.ts'],
  outDir: './npm',
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  testPattern: '**/*.test.{ts,tsx,js,mjs,jsx}',
  importMap: '../deno.json',
  test: false,
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
    version: '1.0.0',
    description: 'The offchain library used for interacting with Mintun contracts',
    repository: {
      type: 'git',
      url: 'git+https://github.com/ikigai-github/mintun',
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync('LICENSE', 'npm/LICENSE');
    Deno.copyFileSync('README.md', 'npm/README.md');
  },
});
