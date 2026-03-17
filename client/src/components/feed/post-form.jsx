import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { imageUrl } from '@/lib/api';

export default function PostForm({ open, onOpenChange, editPost, onSubmit }) {
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [image, setImage] = useState(null);
   const [preview, setPreview] = useState('');
   const [tags, setTags] = useState('');
   const [locationName, setLocationName] = useState('');
   const [locationCountry, setLocationCountry] = useState('');
   const [travelDate, setTravelDate] = useState('');
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      if (editPost) {
         setTitle(editPost.title || '');
         setContent(editPost.content || '');
         setTags(editPost.tags?.join(', ') || '');
         setLocationName(editPost.location?.name || '');
         setLocationCountry(editPost.location?.country || '');
         setTravelDate(editPost.travelDate?.split('T')[0] || '');
         setPreview(imageUrl(editPost.imageUrl));
         setImage(null);
      } else {
         setTitle('');
         setContent('');
         setTags('');
         setLocationName('');
         setLocationCountry('');
         setTravelDate('');
         setPreview('');
         setImage(null);
      }
   }, [editPost, open]);

   const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!editPost && !image) {
         toast.error('Please select an image');
         return;
      }
      setSubmitting(true);
      try {
         const formData = new FormData();
         formData.append('title', title);
         formData.append('content', content);
         if (image) formData.append('image', image);
         if (!image && editPost) formData.append('image', editPost.imageUrl);
         const parsedTags = tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
         if (parsedTags.length) formData.append('tags', JSON.stringify(parsedTags));
         if (locationName) formData.append('locationName', locationName);
         if (locationCountry) formData.append('locationCountry', locationCountry);
         if (travelDate) formData.append('travelDate', travelDate);
         await onSubmit(formData);
         toast.success(editPost ? 'Post updated!' : 'Post created!');
         onOpenChange(false);
      } catch (err) {
         toast.error(err.message);
      }
      setSubmitting(false);
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
               <DialogTitle>{editPost ? 'Edit Journal' : 'New Journal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                     id="title"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     required
                     minLength={5}
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                     id="image"
                     type="file"
                     accept="image/png,image/jpg,image/jpeg"
                     onChange={handleImageChange}
                  />
                  {preview && (
                     <img
                        src={preview}
                        alt="Preview"
                        className="mt-2 h-40 w-full rounded-md object-cover"
                     />
                  )}
               </div>
               <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                     id="content"
                     rows={4}
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     required
                     minLength={5}
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                     id="tags"
                     placeholder="beach, adventure, food"
                     value={tags}
                     onChange={(e) => setTags(e.target.value)}
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                     <Label htmlFor="locationName">City</Label>
                     <Input
                        id="locationName"
                        placeholder="Paris"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="locationCountry">Country</Label>
                     <Input
                        id="locationCountry"
                        placeholder="France"
                        value={locationCountry}
                        onChange={(e) => setLocationCountry(e.target.value)}
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label htmlFor="travelDate">Travel Date</Label>
                  <Input
                     id="travelDate"
                     type="date"
                     value={travelDate}
                     onChange={(e) => setTravelDate(e.target.value)}
                  />
               </div>
               <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Saving...' : editPost ? 'Update' : 'Create'}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
   );
}
