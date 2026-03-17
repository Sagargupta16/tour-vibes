import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import ProfileForm from '@/components/profile/profile-form';
import PasswordForm from '@/components/profile/password-form';
import PageTransition from '@/components/shared/page-transition';

export default function Profile() {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      api.get('/auth/profile')
         .then((data) => setUser(data.user))
         .catch(() => {})
         .finally(() => setLoading(false));
   }, []);

   if (loading) {
      return (
         <div className="mx-auto max-w-2xl px-4 py-8">
            <Skeleton className="mb-6 h-8 w-40" />
            <Skeleton className="h-96 w-full rounded-lg" />
         </div>
      );
   }

   return (
      <PageTransition>
         <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Profile</h1>
            <Tabs defaultValue="profile">
               <TabsList className="mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
               </TabsList>
               <TabsContent value="profile">
                  <Card>
                     <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                     </CardHeader>
                     <CardContent>
                        {user && <ProfileForm user={user} onUpdate={setUser} />}
                     </CardContent>
                  </Card>
               </TabsContent>
               <TabsContent value="security">
                  <Card>
                     <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <PasswordForm />
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>
      </PageTransition>
   );
}
