
import readline from 'readline'

export const rl = readline.promises.createInterface(process.stdin, process.stdout)

export async function delay (ms) {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

