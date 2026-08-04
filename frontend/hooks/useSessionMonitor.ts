import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired, isSessionInactive, clearAuthToken, updateLastActivity } from "@/lib/auth";

export function useSessionMonitor() {
  const router = useRouter();

  useEffect(() => {
    // Update activity timestamp on user interactions
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    // Register activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session validity every minute
    const intervalId = setInterval(() => {
      if (isTokenExpired() || isSessionInactive()) {
        clearAuthToken();
        router.push("/");
      }
    }, 60000); // Check every 60 seconds

    // Also check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (isTokenExpired() || isSessionInactive()) {
          clearAuthToken();
          router.push("/");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [router]);
}
