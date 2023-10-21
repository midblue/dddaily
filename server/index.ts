import * as c from '../common'

import './cleanup/dbEmptyFolderCleanup'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import addOrUpdateRoutes from './routes/addOrUpdate'
import getRoutes from './routes/get'
import removeRoutes from './routes/remove'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  c.l('gray', `${req.method} ${req.path}`)
  next()
})
app.get('/', (req, res) => {
  res.send('Server is running.')
})

app.use('/addOrUpdate', addOrUpdateRoutes)
app.use('/get', getRoutes)
app.use('/remove', removeRoutes)

function init() {
  const port = process.env.PORT || 3003
  app.listen(port, () => {
    c.log(`Server is running on port ${port}`)
  })
}
init()
