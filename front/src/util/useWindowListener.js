import { useEffect } from 'react'

//можна створити власну функцію з використанням useEffect

export function useWindowListener(eventType, listener) {
  useEffect(() => {
    window.addEventListener(eventType, listener)

    return () => {
      window.removeEventListener(eventType, listener)
    }
  }, [eventType, listener])
}
