import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storage, STORAGE_BUCKET_ID } from '../utils/appwrite';

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, onProgress }) => {
      try {
        const fileId = 'unique()';
        const response = await storage.createFile(
          STORAGE_BUCKET_ID,
          fileId,
          file,
          undefined,
          onProgress
        );
        return response;
      } catch (error) {
        console.error('File upload error:', error);
        throw error;
      }
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fileId) => {
      try {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
        return fileId;
      } catch (error) {
        console.error('File delete error:', error);
        throw error;
      }
    },
  });
};

export const getFilePreview = (fileId, width = 200, height = 200) => {
  try {
    return storage.getFilePreview(STORAGE_BUCKET_ID, fileId, width, height);
  } catch (error) {
    console.error('File preview error:', error);
    return null;
  }
};

export const getFileDownload = (fileId) => {
  try {
    return storage.getFileDownload(STORAGE_BUCKET_ID, fileId);
  } catch (error) {
    console.error('File download error:', error);
    return null;
  }
};

export const getFileView = (fileId) => {
  try {
    return storage.getFileView(STORAGE_BUCKET_ID, fileId);
  } catch (error) {
    console.error('File view error:', error);
    return null;
  }
};