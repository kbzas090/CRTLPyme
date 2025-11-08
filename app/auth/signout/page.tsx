'use client';

import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <LogOut className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Cerrar Sesión</CardTitle>
          <CardDescription>
            ¿Estás seguro de que deseas cerrar tu sesión?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full"
            variant="destructive"
          >
            {isSigningOut ? 'Cerrando sesión...' : 'Sí, cerrar sesión'}
          </Button>
          <Button
            onClick={() => window.history.back()}
            disabled={isSigningOut}
            className="w-full"
            variant="outline"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
