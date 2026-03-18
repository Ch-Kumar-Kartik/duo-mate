import { Chrome } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps) {
  const { login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = () => {
    setIsRedirecting(true);
    login();
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isRedirecting}
      className={className}
    >
      <Chrome className="mr-2 h-4 w-4" />
      {isRedirecting ? "Redirecting to Google..." : "Continue with Google"}
    </Button>
  );
}
