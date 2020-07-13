import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'

import pkg from './package.json'

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.es6', '.es', '.mjs']

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'es'
    }
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    typescript(),
    babel({
      exclude: ['node_modules/**', '*.json'],
      extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
      runtimeHelpers: true
    })
  ]
}
