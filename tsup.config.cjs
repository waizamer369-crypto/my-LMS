console.log('>>> LOADED tsup.config.cjs VERSION 2 <<<')

const { defineConfig } = require('tsup')
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const EXTS = ['.ts', '.tsx', '.js', '.jsx']

function resolveWithExtensions(basePath) {
  for (const ext of EXTS) {
    if (fs.existsSync(basePath + ext)) return basePath + ext
  }
  for (const ext of EXTS) {
    const indexPath = path.join(basePath, 'index' + ext)
    if (fs.existsSync(indexPath)) return indexPath
  }
  if (fs.existsSync(basePath)) return basePath
  return null
}

module.exports = defineConfig({
  entry: ['server/boot.ts'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  clean: true,
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
          console.error(`[plugin] FAILED @db alias "${args.path}" -> tried base "${base}"`)
        })

        build.onResolve({ filter: /^@contracts(\/.*)?$/ }, (args) => {
          const sub = args.path.replace(/^@contracts\/?/, '')
          const base = path.join(root, 'contracts', sub || 'index')
          const resolved = resolveWithExtensions(base)
          if (resolved) return { path: resolved }
          console.error(`[plugin] FAILED @contracts alias "${args.path}" -> tried base "${base}"`)
        })

        build.onResolve({ filter: /^\.{1,2}\// }, (args) => {
          const base = path.resolve(path.dirname(args.importer), args.path)
          const resolved = resolveWithExtensions(base)
          if (resolved) return { path: resolved }
          console.error(`[plugin] FAILED relative import "${args.path}" from "${args.importer}" -> tried base "${base}"`)
        })
      },
    },
  ],
})