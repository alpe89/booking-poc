declare module '@nuxt/schema' {
  interface AppConfigInput {
    ui?: {
      colors?: {
        primary?: 'weroad' | string
        secondary?: string
        success?: string
        info?: string
        warning?: string
        error?: string
        neutral?: 'sand' | 'ocean' | string
      }
    }
  }
}

export {}
