import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from './auth';

/**
 * Custom React Hook for Firebase Authentication
 * 
 * Usage:
 * const { user, loading } = useAuth();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (user) return <div>Welcome {user.displayName}</div>;
 * return <div>Please sign in</div>;
 */
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setUser(user);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { user, loading };
};
