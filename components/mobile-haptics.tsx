"use client"

import { useEffect } from "react"

const MOBILE_HAPTIC_PULSE_MS = 6
const ACTIONABLE_SELECTOR = 'a[href], button, [role="button"]'

function canUseMobileHaptics() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }

  if (typeof navigator.vibrate !== "function") {
    return false
  }

  const hasCoarsePointer = window.matchMedia("(any-pointer: coarse)").matches
  const hasTouchPoints = navigator.maxTouchPoints > 0

  return hasCoarsePointer || hasTouchPoints
}

function isDisabledActionable(element: Element) {
  if (element.getAttribute("aria-disabled") === "true") {
    return true
  }

  return element.matches(":disabled")
}

export function MobileHaptics() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!event.isTrusted || !canUseMobileHaptics()) {
        return
      }

      if (!(event.target instanceof Element)) {
        return
      }

      const actionableElement = event.target.closest(ACTIONABLE_SELECTOR)
      if (!actionableElement || isDisabledActionable(actionableElement)) {
        return
      }

      navigator.vibrate(MOBILE_HAPTIC_PULSE_MS)
    }

    document.addEventListener("click", handleClick, { capture: true })

    return () => {
      document.removeEventListener("click", handleClick, { capture: true })
    }
  }, [])

  return null
}
