const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });

export const uploadImageFile = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image is too large. Please choose a file under 5MB.');
  }

  return fileToDataUrl(file);
};
