import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate("/", { replace: true });
      return;
    }

    // Check both publicMetadata and unsafeMetadata
    const userType =
      (user?.publicMetadata?.userType as string) ||
      (user?.unsafeMetadata?.userType as string) ||
      null;

    if (!userType) {
      console.warn("No userType found for user", user?.id);
      navigate("/", { replace: true });
      return;
    }

    switch (userType) {
      case "admin":
        navigate("/admin", { replace: true });
        break;
      case "owner":
        navigate("/owner", { replace: true });
        break;
      case "renter":
        navigate("/renter", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  if (!isLoaded) {
    return <div>Loading...</div>; // prevents blank page
  }

  return <div>Redirecting...</div>; // temporary while navigating
}
