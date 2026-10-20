// Values, validation and the multipart body for the journal form. The rules mirror
// server/routes/feed.js (title and content at least 5 characters) and
// server/middleware/upload.js (PNG or JPG, 5 MB).

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MIN_LENGTH = 5;

export const pinOf = (post) =>
   post?.location?.lat == null ? null : { lat: post.location.lat, lng: post.location.lng };

export const initialValues = (post) => ({
   title: post?.title ?? '',
   content: post?.content ?? '',
   tags: post?.tags ?? [],
   locationName: post?.location?.name ?? '',
   locationCountry: post?.location?.country ?? '',
   travelDate: post?.travelDate?.split('T')[0] ?? '',
   pin: pinOf(post)
});

export const checkImage = (file) => {
   if (!IMAGE_TYPES.has(file.type)) return 'Use a PNG or JPG photo';
   if (file.size > MAX_IMAGE_BYTES) return 'The photo must be 5 MB or smaller';
   return null;
};

export const validate = (values, hasImage) => {
   const errors = {};
   if (!hasImage) errors.image = 'Add a photo for this journal';
   if (values.title.trim().length < MIN_LENGTH) {
      errors.title = `Title must be at least ${MIN_LENGTH} characters`;
   }
   if (values.content.trim().length < MIN_LENGTH) {
      errors.content = `Story must be at least ${MIN_LENGTH} characters`;
   }
   return errors;
};

// express-validator errors arrive as err.data: [{ path, msg }]
export const serverFieldErrors = (data) =>
   Object.fromEntries(
      (Array.isArray(data) ? data : []).filter((e) => e?.path).map((e) => [e.path, e.msg])
   );

export const buildFormData = (values, file, editPost) => {
   const { title, content, tags, locationName, locationCountry, travelDate, pin } = values;
   const formData = new FormData();
   formData.append('title', title.trim());
   formData.append('content', content.trim());
   // The server keeps the stored photo when no new file is sent
   if (file) formData.append('image', file);
   // An edit always sends the list, or removing every tag would keep the old ones
   if (tags.length || editPost) formData.append('tags', JSON.stringify(tags));
   if (locationName.trim()) formData.append('locationName', locationName.trim());
   if (locationCountry.trim()) formData.append('locationCountry', locationCountry.trim());
   if (travelDate) formData.append('travelDate', travelDate);
   // Empty lat/lng on an edit removes an existing pin
   if (pin || pinOf(editPost)) {
      formData.append('lat', pin ? String(pin.lat) : '');
      formData.append('lng', pin ? String(pin.lng) : '');
   }
   return formData;
};
