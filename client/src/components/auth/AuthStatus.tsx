import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { UserDashboard } from "./UserDashboard";
import { Button } from "@/components/ui/button";

export function AuthStatus() {
  const { user, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  if (user) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDashboard(true)}
          className="p-0 h-auto hover:bg-transparent"
        >
          <img
            src={user.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="w-8 h-8 rounded-full hover:ring-2 hover:ring-primary transition-all"
          />
        </Button>
        <UserDashboard 
          open={showDashboard} 
          onOpenChange={setShowDashboard}
        />
      </>
    );
  }

  return <GoogleSignInButton />;
}