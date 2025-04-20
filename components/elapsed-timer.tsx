"use client"

import { useState, useEffect } from "react"

interface ElapsedTimerProps {
  startTime: string
}

export function ElapsedTimer({ startTime }: ElapsedTimerProps) {
  const [elapsedTime, setElapsedTime] = useState("")

  useEffect(() => {
    // Function to calculate and format elapsed time in MM:SS format
    const calculateElapsedTime = () => {
      const start = new Date(startTime).getTime()
      const now = new Date().getTime()
      const elapsedMs = now - start

      // Convert to seconds
      const totalSeconds = Math.floor(elapsedMs / 1000)

      // Format as MM:SS
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // Initial calculation
    setElapsedTime(calculateElapsedTime())

    // Update every second
    const interval = setInterval(() => {
      setElapsedTime(calculateElapsedTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  return (
    <div className="font-mono text-sm">
      Elapsed: <span className="font-bold">{elapsedTime}</span>
    </div>
  )
}
