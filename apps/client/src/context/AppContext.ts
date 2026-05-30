import { createContext, useContext, useReducer, Dispatch } from 'react'

type Theme = 'light' | 'dark'

type AppState = {
  selectedSymbol: string | null
  theme: Theme
}

type AppAction =
  | { type: 'SELECT_SYMBOL'; symbol: string | null }
  | { type: 'TOGGLE_THEME' }

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_SYMBOL':
      return { ...state, selectedSymbol: action.symbol }
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' }
  }
}

const initialState: AppState = { selectedSymbol: null, theme: 'light' }

export const AppContext = createContext<{
  state: AppState
  dispatch: Dispatch<AppAction>
}>({ state: initialState, dispatch: () => {} })

export function useAppContext() {
  return useContext(AppContext)
}

export { useReducer, initialState, reducer }
export type { AppState, AppAction }
