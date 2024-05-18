// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  telemetry: false,

  ssr: false,
  srcDir: 'src/',
  devServer: {
    port: 3033,
  },
  typescript: {
    typeCheck: true,
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    // baseURL: '/dddaily_frontend',
    head: {
      titleTemplate: (titleChunk) => {
        return 'DDDaily'
      },
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
      ],
    },
  },
  css: ['~/assets/css/main.scss'],
})
