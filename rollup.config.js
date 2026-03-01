import typescript from '@rollup/plugin-typescript';
import resolve    from '@rollup/plugin-node-resolve';
import terser     from '@rollup/plugin-terser';
import dts        from 'rollup-plugin-dts';

const tsPlugin = () => typescript({ tsconfig: './tsconfig.json' });

const banner = `/*!
 * pIvotX v1.0.1
 * Lightweight 2D game library — Vanilla JS, TypeScript & React
 * (c) ${new Date().getFullYear()} ColonDev Community | MIT License
 * https://github.com/ColonDev-Community/pIvotX
 */`;

export default [

  // ── 1. Core ESM — import { Canvas } from 'pivotx'
  {
    input:   'src/core/index.ts',
    output:  { file: 'dist/pivotx.esm.js', format: 'esm', banner, sourcemap: true },
    plugins: [resolve(), tsPlugin()],
  },

  // ── 2. Core CJS — const { Canvas } = require('pivotx')
  {
    input:   'src/core/index.ts',
    output:  { file: 'dist/pivotx.cjs.js', format: 'cjs', banner, sourcemap: true, exports: 'named' },
    plugins: [resolve(), tsPlugin()],
  },

  // ── 3. Core UMD unminified — <script src="pivotx.umd.js"> → window.PivotX
  {
    input:   'src/core/index.ts',
    output:  { file: 'dist/pivotx.umd.js', format: 'umd', name: 'PivotX', banner, sourcemap: true, exports: 'named' },
    plugins: [resolve(), tsPlugin()],
  },

  // ── 4. Core UMD minified — CDN production build (unpkg / jsDelivr)
  {
    input:   'src/core/index.ts',
    output:  { file: 'dist/pivotx.umd.min.js', format: 'umd', name: 'PivotX', banner, sourcemap: true, exports: 'named' },
    plugins: [resolve(), tsPlugin(), terser({ format: { comments: /^!/ } })],
  },

  // ── 5. React ESM — import { PivotCanvas } from 'pivotx/react'
  {
    input:    'src/react/index.ts',
    external: ['react', 'react/jsx-runtime'],
    output:   { file: 'dist/react.esm.js', format: 'esm', banner, sourcemap: true },
    plugins:  [resolve(), tsPlugin()],
  },

  // ── 6. React CJS — const { PivotCanvas } = require('pivotx/react')
  {
    input:    'src/react/index.ts',
    external: ['react', 'react/jsx-runtime'],
    output:   { file: 'dist/react.cjs.js', format: 'cjs', banner, sourcemap: true, exports: 'named' },
    plugins:  [resolve(), tsPlugin()],
  },

  // ── 7. Types — core
  {
    input:   'src/core/index.ts',
    output:  { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
  },

  // ── 8. Types — react
  {
    input:   'src/react/index.ts',
    output:  { file: 'dist/react.d.ts', format: 'esm' },
    plugins: [dts()],
  },

];
