import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from "./config";

/**
 * Firebase Authentication Helper Functions
 */

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName?: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name if provided
        if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }

        return userCredential.user;
    } catch (error: any) {
        console.error("Error signing up:", error);
        throw new Error(error.message || "Failed to sign up");
    }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        console.error("Error signing in:", error);
        throw new Error(error.message || "Failed to sign in");
    }
};

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        return userCredential.user;
    } catch (error: any) {
        console.error("Error signing in with Google:", error);
        throw new Error(error.message || "Failed to sign in with Google");
    }
};

// Sign out
export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error: any) {
        console.error("Error signing out:", error);
        throw new Error(error.message || "Failed to sign out");
    }
};

// Reset password
export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        throw new Error(error.message || "Failed to send password reset email");
    }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
    return auth.currentUser;
};
