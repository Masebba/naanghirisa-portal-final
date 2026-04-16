import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const uploadImageFile = async (file: File, folder = 'uploads/images'): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image is too large. Please choose a file under 5MB.');
  }

  if (storage && isFirebaseConfigured) {
    const uniqueName = `${Date.now()}-${slugify(file.name || 'image')}`;
    const fileRef = ref(storage, `${folder}/${uniqueName}`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return getDownloadURL(fileRef);
  }

  return fileToDataUrl(file);
};
