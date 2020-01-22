import { promises as fs } from 'fs'
import path from 'path'
import del from 'del'

const rootPath = path.resolve(__dirname, '..', '..')

/**
 * Clean (delete) unnecessary things in project root
 */
async function cleanRoot() {
  await del(
    [
      `${rootPath}/**`,
      `!${rootPath}`,
      `!${rootPath}/packages`,
      `!${rootPath}/package.json`,
      `!${rootPath}/LICENSE`,
      `!${rootPath}/yarn.lock`, // For debugging
      `!${rootPath}/lerna.json`, // For postprocessing, lerna is needed in Dockerfile.
    ],
    {
      force: true, // Enable deleting path outside of cwd
    },
  )
}

/**
 * Clean unnecessary files in each packages
 */
async function cleanPkg() {
  const pkgsPath = path.resolve(rootPath, 'packages')
  const pkgs = await fs.readdir(pkgsPath) // .e.g ['api', 'hasura', 'hello']
  for (const pkg of pkgs) {
    const pkgPath = path.join(pkgsPath, pkg) // e.g. './packages/api'
    await del(
      [
        `${pkgPath}/**`,
        `!${pkgPath}`,
        `!${pkgPath}/dist`,
        `!${pkgPath}/package.json`,
        `!${pkgPath}/node_modules`,
        `!${pkgPath}/yarn.lock`, // For debugging
      ],
      {
        force: true, // Enable deleting path outside of cwd
      },
    )
  }
}

cleanPkg()
cleanRoot()
