// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  telemetry: false,
  ssr: false,

  // devServer: {
  //   port: 3033,
  // },
  typescript: {
    typeCheck: true,
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    baseURL: '/dddaily',
    head: {
      titleTemplate: 'DDDaily',
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
          href: '/icon.ico',
        },
      ],
    },
  },

  css: ['~/assets/css/main.scss'],
  compatibilityDate: '2024-07-09',

  ignore: [
    '**/*.stories.{js,cts,mts,ts,jsx,tsx}',
    '**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
    '**/*.d.{cts,mts,ts}',
    '**/.{pnpm-store,vercel,netlify,output,git,cache,data}',
    '.nuxt/analyze',
    '.nuxt',
    '**/-*.*',
    'data',
  ],
})
