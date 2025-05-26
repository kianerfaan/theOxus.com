import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { signOutUser } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { Link } from "wouter";

interface UserDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDashboard({ open, onOpenChange }: UserDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [privacyPolicyAgreed, setPrivacyPolicyAgreed] = useState(false);
  const [termsOfServiceAgreed, setTermsOfServiceAgreed] = useState(false);

  // Handle checkbox changes - allow clicking on/off
  const handlePrivacyPolicyChange = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setPrivacyPolicyAgreed(true);
    } else if (checked === false) {
      setPrivacyPolicyAgreed(false);
    }
  };

  const handleTermsOfServiceChange = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setTermsOfServiceAgreed(true);
    } else if (checked === false) {
      setTermsOfServiceAgreed(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onOpenChange(false);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = () => {
    // Placeholder for subscription management
    toast({
      title: "Coming Soon",
      description: "Subscription management will be available soon!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            welcome to theOxus!
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          {user && (
            <div className="flex items-center space-x-3 mb-6">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleManageSubscription}
              variant="link"
              className="text-blue-500 hover:text-blue-600 p-0 h-auto font-normal text-base justify-start"
            >
              manage your subscription
            </Button>

            {/* Privacy Policy and Terms of Service Acknowledgment */}
            <div className="space-y-3 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy-policy"
                  checked={privacyPolicyAgreed}
                  onCheckedChange={handlePrivacyPolicyChange}
                />
                <label htmlFor="privacy-policy" className="text-sm text-gray-600 dark:text-gray-400">
                  I have read and agree to the{" "}
                  <Link href="/privacy">
                    <a className="text-blue-500 hover:text-blue-600 underline" onClick={() => onOpenChange(false)}>
                      Privacy Policy
                    </a>
                  </Link>
                  {" "}(June 1, 2025)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms-of-service"
                  checked={termsOfServiceAgreed}
                  onCheckedChange={handleTermsOfServiceChange}
                />
                <label htmlFor="terms-of-service" className="text-sm text-gray-600 dark:text-gray-400">
                  I have read and agree to the{" "}
                  <Link href="/terms">
                    <a className="text-blue-500 hover:text-blue-600 underline" onClick={() => onOpenChange(false)}>
                      Terms of Service
                    </a>
                  </Link>
                  {" "}(June 1, 2025)
                </label>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              variant="link"
              className="text-red-500 hover:text-red-600 p-0 h-auto font-normal text-base justify-start"
            >
              Log Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}