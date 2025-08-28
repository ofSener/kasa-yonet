'use client'

import { useState, useEffect } from 'react'

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const userAgent = navigator.userAgent

      // Check by screen width
      const isMobileWidth = width < 768
      const isTabletWidth = width >= 768 && width < 1024
      const isDesktopWidth = width >= 1024

      // Check by user agent for touch devices
      const isTouchDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

      setIsMobile(isMobileWidth || (isTouchDevice && width < 1024))
      setIsTablet(isTabletWidth && !isTouchDevice)
      setIsDesktop(isDesktopWidth && !isTouchDevice)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  return { isMobile, isTablet, isDesktop }
}

export function useResponsiveLayout() {
  const { isMobile, isTablet, isDesktop } = useDevice()

  return {
    isMobile,
    isTablet,
    isDesktop,
    shouldUseMobileLayout: isMobile,
    shouldUseTabletLayout: isTablet,
    shouldUseDesktopLayout: isDesktop
  }
}