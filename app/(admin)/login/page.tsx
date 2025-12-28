"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdmin } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Authenticating...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await loginAdmin(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-zinc-500/5 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md shadow-xl border-zinc-200/50 dark:border-zinc-800/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                placeholder="Enter username" 
                required 
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Enter password" 
                required 
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <p>Restricted Area</p>
          <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-xs font-mono">
            Demo: admin / admin123
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
