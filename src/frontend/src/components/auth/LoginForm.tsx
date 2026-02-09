import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { Chrome, Twitter, Mail } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGoogleLogin = () => {
        setIsLoading(true);
        // TODO: Implement Google OAuth
        setTimeout(() => setIsLoading(false), 1000);
        console.log("Google login clicked");
    };

    const handleTwitterLogin = () => {
        setIsLoading(true);
        // TODO: Implement Twitter OAuth
        setTimeout(() => setIsLoading(false), 1000);
        console.log("Twitter login clicked");
    };

    return (
        <Card className="w-full max-w-sm border-0 shadow-lg sm:border sm:shadow-sm">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Choose a method to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading}>
                        <Chrome className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button variant="outline" onClick={handleTwitterLogin} disabled={isLoading}>
                        <Twitter className="mr-2 h-4 w-4" />
                        Twitter
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                        </span>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email" className="sr-only">Email</Label>
                    <Input id="email" type="email" placeholder="name@example.com" disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password" className="sr-only">Password</Label>
                    <Input id="password" type="password" placeholder="Password" disabled={isLoading} />
                </div>
                <Button disabled={isLoading} className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Sign In with Email
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                <div>
                    Don&apos;t have an account?{" "}
                    <a href="#" className="underline underline-offset-4 hover:text-primary">
                        Sign up
                    </a>
                </div>
                <a href="#" className="text-xs hover:text-primary">
                    Forgot your password?
                </a>
            </CardFooter>
        </Card>
    );
}
