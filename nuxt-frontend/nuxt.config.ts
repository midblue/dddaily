// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  telemetry: false,
  // devtools: { enabled: true },
  ssr: false,
  srcDir: 'src/',
  devServer: {
    port: 3001,
  },
  typescript: {
    typeCheck: true,
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  css: ['~/assets/css/main.scss'],
})
