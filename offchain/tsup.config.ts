import type { Options } from 'tsup';

const isProduction = process.env.NODE_ENV === 'production';

export const tsup: Options = {
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: isProduction,
  bundle: isProduction,
  target: 'es2022',
  noExternal: ['@sinclair/typebox'],
  sourcemap: true,
  treeshake: 'safest',
  shims: true,
  entryPoints: ['src/index.ts'],
  entry: ['src/**/*.ts', '!src/**/*.test.ts'],
};
