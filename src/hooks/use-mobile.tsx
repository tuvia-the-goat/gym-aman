
import * as React from "react"

// Increased breakpoint to better adapt for desktop
const MOBILE_BREAKPOINT = 1024 // Changed from 768 to 1024 for better desktop adaptation

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check initial state
    checkMobile()
    
    // Setup event listener
    window.addEventListener("resize", checkMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return !!isMobile
}

// Add this for backwards compatibility
export const useMobile = useIsMobile;
