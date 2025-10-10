"use client";

import { useState } from "react";
import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useDualAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || t("Invalid credentials"));
      } else {
        router.push("/");
      }
    } catch {
      setError(t("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{t("Sign In")}</CardTitle>
          <CardDescription>
            Bon retour ! Veuillez vous connecter à votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={t("Email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("Password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder={t("Password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-center text-red-600 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? t("Loading...") : t("Sign In")}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("Don't have an account?")}{' '}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Enregistrer votre école
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-800">
            Identifiants de démonstration :
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              <strong>Admin :</strong> admin@harakapay.com / HarakaPay2025!Admin
            </p>
            <p>
              <strong>Marci Admin :</strong> marci@harakapay.com /
              HarakaPay2025!Marci
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
