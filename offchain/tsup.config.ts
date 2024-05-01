import type { Options } from 'tsup';

const isProduction = process.env.NODE_ENV === 'production';

export const tsup: Options = {
  splitting: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: isProduction,
  bundle: isProduction,
  target: 'es2022',
  skipNodeModulesBundle: true,
  sourcemap: true,
  treeshake: true,
  shims: true,
  external: ['lucid-cardano', '@sinclair/typebox'],
  entryPoints: ['src/index.ts'],
  entry: ['src/**/*.ts', '!src/**/*.test.ts'],
};
