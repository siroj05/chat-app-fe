import { useEffect, useState } from "react"

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  const isDebouncing = value !== debouncedValue

  return { debouncedValue, isDebouncing }
}