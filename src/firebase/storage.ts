import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    UploadResult
} from "firebase/storage";
import { storage } from "./config";

/**
 * Firebase Storage Helper Functions
 * These utilities make it easier to upload, download, and manage files
 */

// Upload a file to Firebase Storage
export const uploadFile = async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        const storageRef = ref(storage, path);

        if (onProgress) {
            // Use resumable upload with progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress(progress);
                    },
                    (error) => {
                        console.error("Error uploading file:", error);
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    }
                );
            });
        } else {
            // Simple upload without progress tracking
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

// Upload multiple files
export const uploadMultipleFiles = async (
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
    try {
        const uploadPromises = files.map((file, index) => {
            const filePath = `${basePath}/${file.name}`;
            return uploadFile(file, filePath, (progress) => {
                if (onProgress) {
                    onProgress(index, progress);
                }
            });
        });

        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Error uploading multiple files:", error);
        throw error;
    }
};

// Get download URL for a file
export const getFileURL = async (path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error getting file URL:", error);
        throw error;
    }
};

// Delete a file from storage
export const deleteFile = async (path: string): Promise<void> => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
};

// List all files in a directory
export const listFiles = async (path: string) => {
    try {
        const storageRef = ref(storage, path);
        const result = await listAll(storageRef);

        const files = await Promise.all(
            result.items.map(async (itemRef) => ({
                name: itemRef.name,
                fullPath: itemRef.fullPath,
                url: await getDownloadURL(itemRef)
            }))
        );

        return files;
    } catch (error) {
        console.error("Error listing files:", error);
        throw error;
    }
};

// Helper function to generate unique file names
export const generateUniqueFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const nameWithoutExtension = originalName.replace(`.${extension}`, '');

    return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
};
