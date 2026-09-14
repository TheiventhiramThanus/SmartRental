import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    DocumentData,
    QueryConstraint
} from "firebase/firestore";
import { db } from "./config";

/**
 * Firestore Helper Functions
 * These utilities make it easier to interact with Firebase Firestore
 */

// Get a single document by ID
export const getDocument = async (collectionName: string, docId: string) => {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        throw error;
    }
};

// Get all documents from a collection
export const getDocuments = async (collectionName: string, ...queryConstraints: QueryConstraint[]) => {
    try {
        const collectionRef = collection(db, collectionName);
        const q = queryConstraints.length > 0
            ? query(collectionRef, ...queryConstraints)
            : collectionRef;

        const querySnapshot = await getDocs(q);
        const documents: DocumentData[] = [];

        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });

        return documents;
    } catch (error) {
        console.error("Error getting documents:", error);
        throw error;
    }
};

// Add a new document
export const addDocument = async (collectionName: string, data: DocumentData) => {
    try {
        const collectionRef = collection(db, collectionName);
        const docRef = await addDoc(collectionRef, {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return { id: docRef.id, ...data };
    } catch (error) {
        console.error("Error adding document:", error);
        throw error;
    }
};

// Update an existing document (or create it if it doesn't exist)
export const updateDocument = async (collectionName: string, docId: string, data: DocumentData) => {
    try {
        const docRef = doc(db, collectionName, docId);
        // Using setDoc with { merge: true } instead of updateDoc
        // This prevents "No document to update" errors and creates the doc if missing
        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return { id: docId, ...data };
    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
};

// Export query helpers for convenience
export { where, orderBy, limit };
