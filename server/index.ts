import * as c from '../common'

import './upkeep/dbEmptyFolderCleanup'
import './upkeep/dbBackup'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import addOrUpdateRoutes from './routes/addOrUpdate'
import getRoutes from './routes/get'
import removeRoutes from './routes/remove'

const routerBase = '/dddaily'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  c.l('gray', `${req.method} ${req.path}`)
  next()
})
app.get(`${routerBase}`, (req, res) => {
  res.send(`Server is running. ${routerBase}`)
})

app.use(`${routerBase}/addOrUpdate`, addOrUpdateRoutes)
app.use(`${routerBase}/get`, getRoutes)
app.use(`${routerBase}/remove`, removeRoutes)

function init() {
  const port = process.env.PORT || 3003
  app.listen(port, () => {
    c.log(`Server is running on port ${port}`)
  })
}
init()
