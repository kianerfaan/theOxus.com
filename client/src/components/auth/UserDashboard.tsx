import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { signOutUser } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface UserDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDashboard({ open, onOpenChange }: UserDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

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