import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired, clearAuthToken } from "@/lib/auth";

export function useSessionMonitor() {
  const router = useRouter();

  useEffect(() => {
    // Check session validity every minute
    const intervalId = setInterval(() => {
      if (isTokenExpired()) {
        clearAuthToken();
        router.push("/");
      }
    }, 60000); // Check every 60 seconds

    // Also check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isTokenExpired()) {
        clearAuthToken();
        router.push("/");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);
}
