import path from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'
import del from 'del'

const execAsync = promisify(exec)

const rootPath = path.resolve(__dirname, '..', '..')

async function prune() {
  /**
   * This will give package list the target(build) package depends on.
   * The target package itself is included as well.
   *
   */
  const command = `npx lerna list --all --scope '@jjangga0214/${process.env.PACKAGE}' \
  --json --include-dependencies --loglevel silent --no-progress`
  const { stdout, stderr } = await execAsync(command)

  if (stderr) {
    throw new Error(stderr)
  }

  interface LernaPkgInfo {
    name: string
    version: string
    location: string // absolute path
    private: boolean
  }
  const referencedPkgs: LernaPkgInfo[] = JSON.parse(stdout)
  const referencedPkgsPaths = referencedPkgs.map(pkg => pkg.location)
  const pkgsPath = path.resolve(rootPath, 'packages')
  await del(
    [
      `${pkgsPath}/**`,
      `!${pkgsPath}`,
      ...referencedPkgsPaths.map(pkgPath => `!${pkgPath}`),
    ],
    {
      force: true, // enable deleting path outside of cwd
    },
  )
}

prune()
