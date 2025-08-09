declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TRIGGER_SECRET_KEY?: string
      TRIGGER_PROJECT_REF?: string
    }
  }
}

export {}
