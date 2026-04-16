import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ensureFirebase } from './firebase';

export async function uploadImage(file: File, folder = 'uploads') {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image is too large. Please choose a file under 5MB.');
  }

  const { storage } = ensureFirebase();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `${folder}/${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);
  return { path, url };
}