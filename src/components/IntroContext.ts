import { createContext, useContext } from 'react'

/** True once the opening film-leader countdown has finished (or was skipped). */
export const IntroContext = createContext(true)
export const useIntroDone = () => useContext(IntroContext)
