import * as c from '../common'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import { db } from './db/db'

import saveRoutes from './routes/save'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  c.log('gray', `${req.method} ${req.path}`, req.body)
  next()
})
app.get('/', (req, res) => {
  res.send('Server is running.')
})

app.use('/save', saveRoutes)

function init() {
  const port = process.env.PORT || 3003
  app.listen(port, () => {
    c.log(`Server is running on port ${port}`)
  })
}
init()
