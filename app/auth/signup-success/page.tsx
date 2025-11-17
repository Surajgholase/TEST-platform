"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from 'lucide-react';

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 rounded-lg bg-muted p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm">
              <p className="font-medium">Confirmation email sent</p>
              <p className="text-muted-foreground mt-1">
                Please check your email and click the confirmation link to complete your signup.
              </p>
            </div>
          </div>
          <Link href="/auth/login" className="block">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
