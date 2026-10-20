import { lazy, Suspense, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { imageUrl } from '@/lib/api';
import { readAsDataUrl } from '@/lib/read-file';
import Field from './field';
import ImageDropZone from './image-drop-zone';
import TagInput from './tag-input';
import {
   buildFormData,
   checkImage,
   initialValues,
   serverFieldErrors,
   validate
} from './post-form-data';

// Leaflet is the heaviest dependency; load it only once the form opens
const LocationPicker = lazy(() => import('@/components/map/location-picker'));

// Lives inside the dialog popup, which unmounts on close, so every open starts fresh
export default function PostFormBody({ editPost, onSubmit, onDone, onCancel }) {
   const [values, setValues] = useState(() => initialValues(editPost));
   const [image, setImage] = useState(null);
   const [imageError, setImageError] = useState(null);
   const [touched, setTouched] = useState({});
   const [submitted, setSubmitted] = useState(false);
   const [serverErrors, setServerErrors] = useState({});
   const [submitting, setSubmitting] = useState(false);

   // The newest pick wins even if an older, larger file finishes reading later
   const pickRef = useRef(null);

   const preview = image?.url || (editPost ? imageUrl(editPost.imageUrl) : '');
   const errors = { ...validate(values, Boolean(preview)), ...serverErrors };
   if (imageError && !preview) errors.image = imageError;
   const shown = (field) => ((touched[field] || submitted) && errors[field]) || null;
   const a11y = (field) => ({
      'aria-invalid': Boolean(shown(field)),
      'aria-describedby': shown(field) ? `pf-${field}-error` : undefined,
      onBlur: () => setTouched((t) => ({ ...t, [field]: true }))
   });

   const set = (field) => (value) => {
      setValues((v) => ({ ...v, [field]: value }));
      if (serverErrors[field]) setServerErrors(({ [field]: _, ...rest }) => rest);
   };

   const selectImage = (file) => {
      const problem = checkImage(file);
      setTouched((t) => ({ ...t, image: true }));
      // With a usable photo already in place, a bad pick should not block the form
      if (problem && preview) {
         toast.error(problem);
         return;
      }
      setImageError(problem);
      if (!problem) void showPreview(file);
   };

   const showPreview = async (file) => {
      pickRef.current = file;
      try {
         const url = await readAsDataUrl(file);
         if (pickRef.current === file) setImage({ file, url });
      } catch (err) {
         toast.error(err.message);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitted(true);
      const first = ['image', 'title', 'content'].find((field) => errors[field]);
      if (first) {
         document.getElementById(`pf-${first}`)?.focus();
         return;
      }
      setSubmitting(true);
      try {
         await onSubmit(buildFormData(values, image?.file, editPost));
         toast.success(editPost ? 'Journal updated' : 'Journal published', {
            description: values.title.trim()
         });
         onDone();
      } catch (err) {
         setServerErrors(serverFieldErrors(err.data));
         toast.error(err.message || 'Could not save the journal');
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
         {/* Only this area scrolls, so the action bar stays within reach on phones */}
         <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <fieldset disabled={submitting} className="min-w-0 space-y-5">
               <Field id="pf-image" label="Photo" error={shown('image')}>
                  <ImageDropZone
                     id="pf-image"
                     preview={preview}
                     error={shown('image')}
                     isEdit={Boolean(editPost)}
                     hasNewFile={Boolean(image)}
                     onSelect={selectImage}
                     onRemove={() => {
                        setImage(null);
                        setImageError(null);
                     }}
                  />
               </Field>

               <Field id="pf-title" label="Title" error={shown('title')}>
                  <Input
                     id="pf-title"
                     value={values.title}
                     onChange={(e) => set('title')(e.target.value)}
                     placeholder="Sunrise over the rice terraces"
                     maxLength={120}
                     className="h-11"
                     {...a11y('title')}
                  />
               </Field>

               <Field
                  id="pf-content"
                  label="Story"
                  hint={`${values.content.trim().length} characters`}
                  error={shown('content')}
               >
                  <Textarea
                     id="pf-content"
                     rows={6}
                     value={values.content}
                     onChange={(e) => set('content')(e.target.value)}
                     placeholder="Where you went, what you ate, what you would tell a friend"
                     className="min-h-36"
                     {...a11y('content')}
                  />
               </Field>

               <Field id="pf-tags" label="Tags" hint="Enter or comma to add">
                  <TagInput id="pf-tags" value={values.tags} onChange={set('tags')} />
               </Field>

               <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="pf-city" label="City">
                     <Input
                        id="pf-city"
                        placeholder="Kyoto"
                        value={values.locationName}
                        onChange={(e) => set('locationName')(e.target.value)}
                        className="h-11"
                     />
                  </Field>
                  <Field id="pf-country" label="Country">
                     <Input
                        id="pf-country"
                        placeholder="Japan"
                        value={values.locationCountry}
                        onChange={(e) => set('locationCountry')(e.target.value)}
                        className="h-11"
                     />
                  </Field>
               </div>

               <Field id="pf-pin" label="Map pin" hint="Optional">
                  <Suspense
                     fallback={<div className="h-48 w-full animate-pulse rounded-lg bg-muted" />}
                  >
                     <LocationPicker
                        value={values.pin}
                        onChange={set('pin')}
                        query={[values.locationName, values.locationCountry]
                           .filter(Boolean)
                           .join(', ')}
                     />
                  </Suspense>
               </Field>

               <Field id="pf-date" label="Travel date" hint="Optional" className="sm:max-w-xs">
                  <Input
                     id="pf-date"
                     type="date"
                     value={values.travelDate}
                     onChange={(e) => set('travelDate')(e.target.value)}
                     className="h-11"
                  />
               </Field>
            </fieldset>
         </div>

         <div className="flex gap-2 border-t bg-muted/40 px-5 py-4 sm:justify-end">
            <Button
               type="button"
               variant="outline"
               className="h-11 flex-1 sm:h-10 sm:flex-none"
               onClick={onCancel}
            >
               Cancel
            </Button>
            <Button
               type="submit"
               className="h-11 flex-1 sm:h-10 sm:flex-none sm:px-5"
               disabled={submitting}
            >
               {submitting && <Loader2 className="animate-spin" />}
               {submitting && 'Saving...'}
               {!submitting && (editPost ? 'Save changes' : 'Publish journal')}
            </Button>
         </div>
      </form>
   );
}
