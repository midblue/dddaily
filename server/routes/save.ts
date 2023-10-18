import * as c from '../../common'
import { Router } from 'express'
import { db } from '../db/db'

const routes = Router()

routes.post('/element', async (req, res) => {
  c.log('gray', 'POST /element', req.body)
  res.json({ message: 'Hello World!' })
})

export default routes
