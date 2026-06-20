const { spawn } = require('child_process')

// Clear the problematic env var that breaks Electron
delete process.env.ELECTRON_RUN_AS_NODE

const isWindows = process.platform === 'win32'
const cmd = isWindows ? 'npx' : 'npx'
const args = ['electron-vite', 'dev']

const child = spawn(cmd, args, {
  cwd: __dirname + '/..',
  stdio: 'inherit',
  env: process.env,
  shell: true
})

child.on('close', (code) => {
  process.exit(code ?? 0)
})
