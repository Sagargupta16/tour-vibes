// A picked photo as a data: URL for its preview. Unlike an object URL it needs no
// revoking; it is also the pattern CodeQL accepts (it treats an object URL built from
// a file input as DOM text reaching the page)
export const readAsDataUrl = (file) =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error ?? new Error('Could not read that photo'));
      reader.readAsDataURL(file);
   });
