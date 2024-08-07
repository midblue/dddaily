import path from 'path'
import * as c from '../../common'
import fs from 'fs'

const dataFolderPath = path.join('./', 'data')

function cleanUp() {
  c.log('blue', 'Cleaning up empty folders')
  // scan recursively for empty folders and remove them
  const emptyFolders = new Set<string>()

  function scan(folderPath: string) {
    const exists = fs.existsSync(folderPath)
    if (!exists) {
      return
    }
    const files = fs.readdirSync(folderPath)
    if (files.length === 0) {
      emptyFolders.add(folderPath)
      return
    }
    files.forEach((file) => {
      const filePath = path.join(folderPath, file)
      if (fs.statSync(filePath).isDirectory()) {
        scan(filePath)
      }
    })
  }

  scan(dataFolderPath)

  emptyFolders.forEach((folderPath) => {
    // c.log('gray', 'Removing empty folder', folderPath)
    fs.rmdirSync(folderPath)
  })

  if (emptyFolders.size)
    c.log(
      'gray',
      `Cleaned up ${emptyFolders.size} empty folders`,
    )
}

export function start() {
  setInterval(cleanUp, 1000 * 60 * 60)
  setTimeout(cleanUp, 1000 * 3)
}
