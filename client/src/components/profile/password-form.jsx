import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function PasswordForm() {
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [saving, setSaving] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
         toast.error('Passwords do not match');
         return;
      }
      setSaving(true);
      try {
         await api.put('/auth/password', { currentPassword, newPassword });
         toast.success('Password changed successfully');
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
      } catch (err) {
         toast.error(err.message);
      }
      setSaving(false);
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div className="space-y-2">
            <Label htmlFor="current">Current Password</Label>
            <Input
               id="current"
               type="password"
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
               required
            />
         </div>
         <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <Input
               id="new"
               type="password"
               placeholder="Min. 8 characters"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               required
               minLength={8}
            />
         </div>
         <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
               id="confirm"
               type="password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               required
               minLength={8}
            />
         </div>
         <Button type="submit" disabled={saving}>
            {saving ? 'Changing...' : 'Change Password'}
         </Button>
      </form>
   );
}
