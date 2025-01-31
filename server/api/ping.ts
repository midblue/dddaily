export default defineEventHandler(async (event) => {
  setResponseStatus(event, 200)
  return { status: 200, body: { ok: true } }
})
