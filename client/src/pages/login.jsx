import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import PageTransition from '@/components/shared/page-transition';

export default function Login() {
   const { isAuth, login, loading } = useAuth();
   const navigate = useNavigate();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   if (isAuth) return <Navigate to="/journals" replace />;

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await login(email, password);
         toast.success('Welcome back!');
         navigate('/journals', { replace: true });
      } catch (err) {
         toast.error(err.message);
      }
   };

   return (
      <PageTransition>
         <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
            <Card className="w-full max-w-md">
               <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                           id="email"
                           type="email"
                           placeholder="you@example.com"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                           id="password"
                           type="password"
                           placeholder="Min. 8 characters"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                           minLength={8}
                        />
                     </div>
                     <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                     </Button>
                  </form>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                     Don&apos;t have an account?{' '}
                     <Link to="/signup" className="font-medium text-foreground hover:underline">
                        Sign up
                     </Link>
                  </p>
               </CardContent>
            </Card>
         </div>
      </PageTransition>
   );
}
