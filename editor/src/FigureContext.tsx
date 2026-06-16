import { createContext, useContext } from 'react'

export type FigureContextValue = {
  urls: Record<string, string>
}

export const FigureContext = createContext<FigureContextValue>({ urls: {} })

export const useFigures = () => useContext(FigureContext)
