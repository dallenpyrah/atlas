'use client'

import * as React from 'react'

export type AppContextType = 'personal' | 'organization' | 'space'

export type SelectedContext = {
  id: string
  name: string
  type: AppContextType
  organizationId?: string | null
}

type AppContextValue = {
  context: SelectedContext | null
  setContext: (context: SelectedContext) => void
}

const STORAGE_KEY = 'atlas.selectedContext'

const AppContext = React.createContext<AppContextValue | undefined>(undefined)

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [context, setContextState] = React.useState<SelectedContext | null>(null)

  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as SelectedContext
        if (parsed && parsed.type) {
          setContextState(parsed)
        }
      }
    } catch (_) {}
  }, [])

  const setContext = React.useCallback((next: SelectedContext) => {
    setContextState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (_) {}
  }, [])

  const value = React.useMemo(() => ({ context, setContext }), [context, setContext])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  const value = React.useContext(AppContext)
  if (!value) {
    throw new Error('useAppContext must be used within a ContextProvider')
  }
  return value
}
