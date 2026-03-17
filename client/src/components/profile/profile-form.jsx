import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api, imageUrl } from '@/lib/api';

export default function ProfileForm({ user, onUpdate }) {
   const [name, setName] = useState(user.name || '');
   const [bio, setBio] = useState(user.bio || '');
   const [location, setLocation] = useState(user.location || '');
   const [status, setStatus] = useState(user.status || '');
   const [avatar, setAvatar] = useState(null);
   const [preview, setPreview] = useState(imageUrl(user.avatar));
   const [saving, setSaving] = useState(false);

   const handleAvatar = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         const formData = new FormData();
         formData.append('name', name);
         formData.append('bio', bio);
         formData.append('location', location);
         formData.append('status', status);
         if (avatar) formData.append('image', avatar);
         const data = await api.put('/auth/profile', formData);
         onUpdate(data.user);
         toast.success('Profile updated');
      } catch (err) {
         toast.error(err.message);
      }
      setSaving(false);
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
               <AvatarImage src={preview} />
               <AvatarFallback className="text-lg">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
               </AvatarFallback>
            </Avatar>
            <div>
               <Label htmlFor="avatar">Avatar</Label>
               <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  className="mt-1"
               />
            </div>
         </div>
         <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
         </div>
         <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
               id="bio"
               rows={3}
               maxLength={300}
               placeholder="Tell us about yourself..."
               value={bio}
               onChange={(e) => setBio(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{bio.length}/300</p>
         </div>
         <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
               id="location"
               placeholder="City, Country"
               value={location}
               onChange={(e) => setLocation(e.target.value)}
            />
         </div>
         <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input
               id="status"
               placeholder="What are you up to?"
               value={status}
               onChange={(e) => setStatus(e.target.value)}
            />
         </div>
         <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
         </Button>
      </form>
   );
}
