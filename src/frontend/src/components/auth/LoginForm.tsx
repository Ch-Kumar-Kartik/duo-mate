import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGoogleLogin = () => {
        setIsLoading(true);
        // TODO: Implement Google OAuth
        setTimeout(() => setIsLoading(false), 1000);
        console.log("Google login clicked");
    };

    return (
        <Card className="w-full max-w-sm border-0 shadow-lg sm:border sm:shadow-sm">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button className="w-full" variant="outline" onClick={handleGoogleLogin} disabled={isLoading}>
                    <Chrome className="mr-2 h-4 w-4" />
                    Continue with Google
                </Button>
            </CardContent>
        </Card>
    );
}
