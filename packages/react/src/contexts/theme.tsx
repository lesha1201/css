import type { Theme } from '@master/css'
import { Context, createContext, useContext } from 'react'

export const ThemeContext: Context<Theme> = createContext<Theme>(null)

export function useTheme() {
    return useContext(ThemeContext)
}