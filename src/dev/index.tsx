// src/dev/index.tsx
// Single entry point for the dev harness — imported only when import.meta.env.DEV
import DevNavigator from './DevNavigator'

export function DevApp() {
  return <DevNavigator />
}
