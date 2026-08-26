const { defineConfig } = require('tsup')
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const EXTS = ['.ts', '.tsx', '.js', '.jsx']

function stripKnownExt(p) {
  return p.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')
}

function resolveWithExtensions(rawBasePath) {
  const basePath = stripKnownExt(rawBasePath)
  for (const ext of EXTS) {
    if (fs.existsSync(basePath + ext)) return basePath + ext
  }
  for (const ext of EXTS) {
    const indexPath = path.join(basePath, 'index' + ext)
    if (fs.existsSync(indexPath)) return indexPath
  }
  if (fs.existsSync(rawBasePath)) return rawBasePath
  return null
}

module.exports = defineConfig({
  entry: ['server/boot.ts'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  // IMPORTANT: do NOT clean 'dist' — Vite's frontend build output
  // (dist/public) lives inside this same folder, and clean:true was
  // deleting it right after Vite created it.
  clean: false,
  splitting: false,
  bundle: true,
  esbuildOptions(options) {
    options.resolveExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  esbuildPlugins: [
    {
      name: 'resolve-ts-and-aliases',
      setup(build) {
        build.onResolve({ filter: /^@db(\/.*)?$/ }, (args) => {
          const sub = args.path.replace(/^@db\/?/, '')
          const base = path.join(root, 'db', sub || 'index')
          const resolved = resolveWithExtensions(base)
          if (resolved) return { path: resolved }
        })

        build.onResolve({ filter: /^@contracts(\/.*)?$/ }, (args) => {
          const sub = args.path.replace(/^@contracts\/?/, '')
          const base = path.join(root, 'contracts', sub || 'index')
          const resolved = resolveWithExtensions(base)
          if (resolved) return { path: resolved }
        })

        build.onResolve({ filter: /^\.{1,2}\// }, (args) => {
          const base = path.resolve(path.dirname(args.importer), args.path)
          const resolved = resolveWithExtensions(base)
          if (resolved) return { path: resolved }
        })
      },
    },
  ],
})
