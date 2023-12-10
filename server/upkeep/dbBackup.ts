import * as c from '../../common'
import path from 'path'
import fs from 'fs'

let backupInterval: NodeJS.Timeout
const backupTime = 1000 * 60 * 60 * 24 // 1 day
const backupPath = path.join(__dirname, '../../../backups')
const dataPath = path.join(__dirname, '../../../data')
const maxBackups = 30

async function backUp() {
  c.log('blue', 'Backing up data')
  const startTimestamp = Date.now()

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath)
  }
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath)
  }

  const backups = await fs.promises.readdir(backupPath, {
    withFileTypes: true,
  })

  // * remove old backups
  let backupCount = backups.filter((b) =>
    b.isDirectory(),
  ).length
  while (backupCount >= maxBackups) {
    const oldestBackup = backups.sort((a, b) => {
      return a.name > b.name ? 1 : -1
    })[0]
    await fs.promises.rm(
      path.join(backupPath, oldestBackup.path),
      {
        recursive: true,
      },
    )
    backups.shift()
    backupCount--
  }

  const date = c.dateToDateString()
  const backupName = `${date}`
  const backupFolder = path.join(backupPath, backupName)
  if (fs.existsSync(backupFolder)) {
    await fs.promises.rm(backupFolder, {
      recursive: true,
    })
  }
  await copyDirDeep(dataPath, backupFolder)

  c.log(
    'blue',
    `Backup complete in ${Date.now() - startTimestamp}ms`,
  )
}

async function copyDirDeep(src: string, dest: string) {
  await fs.promises.mkdir(dest)
  const entries = await fs.promises.readdir(src, {
    withFileTypes: true,
  })
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    entry.isDirectory()
      ? await copyDirDeep(srcPath, destPath)
      : await fs.promises.copyFile(srcPath, destPath)
  }
}

backupInterval = setInterval(backUp, backupTime)

setTimeout(backUp, 1000 * 30)
