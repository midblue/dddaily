import * as c from '~/common'

export default defineEventHandler((event) => {
  const path = event.path
  if (!path.includes('/api/')) {
    return
  }
  c.log('gray', 'Request: ' + getRequestURL(event))
})
