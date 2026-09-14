/**
 * Firebase Module - Central Export
 * Import Firebase services and utilities from this file
 * 
 * Usage Examples:
 * 
 * // Import Firebase services
 * import { auth, db, storage } from '@/firebase';
 * 
 * // Import auth utilities
 * import { signIn, signUp, logOut } from '@/firebase';
 * 
 * // Import Firestore utilities
 * import { getDocument, addDocument, updateDocument } from '@/firebase';
 * 
 * // Import Storage utilities
 * import { uploadFile, deleteFile, getFileURL } from '@/firebase';
 */

// Export Firebase app and services
export { app, analytics, auth, db, storage, rtdb } from './config';

// Export authentication utilities
export {
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    resetPassword,
    onAuthChange,
    getCurrentUser
} from './auth';

// Export Firestore utilities
export {
    getDocument,
    getDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    where,
    orderBy,
    limit
} from './firestore';

// Export Storage utilities
export {
    uploadFile,
    uploadMultipleFiles,
    getFileURL,
    deleteFile,
    listFiles,
    generateUniqueFileName
} from './storage';

// Export React hooks
export { useAuth } from './hooks';

