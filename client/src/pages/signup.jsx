import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import PageTransition from '@/components/shared/page-transition';

export default function Signup() {
   const { isAuth, signup, loading } = useAuth();
   const navigate = useNavigate();
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   if (isAuth) return <Navigate to="/journals" replace />;

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await signup(name, email, password);
         toast.success('Account created! Please sign in.');
         navigate('/login', { replace: true });
      } catch (err) {
         toast.error(err.message);
      }
   };

   return (
      <PageTransition>
         <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
            <Card className="w-full max-w-md">
               <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Create account</CardTitle>
                  <CardDescription>Start sharing your travel stories</CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                           id="name"
                           placeholder="Your name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           required
                        />
                     </div>
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
                        {loading ? 'Creating account...' : 'Sign Up'}
                     </Button>
                  </form>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                     Already have an account?{' '}
                     <Link to="/login" className="font-medium text-foreground hover:underline">
                        Sign in
                     </Link>
                  </p>
               </CardContent>
            </Card>
         </div>
      </PageTransition>
   );
}
