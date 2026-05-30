import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

if (import.meta.env.DEV) {
  const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render')
  whyDidYouRender(React, { trackAllPureComponents: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
