import { useState } from 'react';
import { useAuth, signIn, signUp, logOut } from '../firebase';

/**
 * Example Authentication Component
 * This demonstrates how to use Firebase authentication in your components
 * 
 * You can copy this pattern to your actual login/register pages
 */
export const AuthExample = () => {
    const { user, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signUp(email, password, name);
            alert('Account created successfully!');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signIn(email, password);
            alert('Signed in successfully!');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await logOut();
            alert('Signed out successfully!');
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (user) {
        return (
            <div className="p-4 max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
                <div className="bg-gray-100 p-4 rounded mb-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Name:</strong> {user.displayName || 'Not set'}</p>
                    <p><strong>User ID:</strong> {user.uid}</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Firebase Auth Example</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSignUp} className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Sign Up</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Sign Up
                </button>
            </form>

            <form onSubmit={handleSignIn}>
                <h3 className="text-xl font-semibold mb-3">Sign In</h3>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
};
