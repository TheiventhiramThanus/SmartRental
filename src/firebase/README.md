# Firebase Integration Guide - SmartRental

This guide provides comprehensive documentation for using Firebase in the SmartRental application.

## 📦 Installation

Firebase has already been installed and configured. The following packages are included:
- `firebase` - Core Firebase SDK with Auth, Firestore, Storage, and Analytics

## 🔧 Configuration

Firebase is configured in `src/firebase/config.ts` with the following services:
- **Authentication** - User sign up, sign in, and management
- **Firestore** - NoSQL database for storing data
- **Storage** - File and image storage
- **Analytics** - User behavior tracking

## 🚀 Quick Start

### Import Firebase Services

```typescript
// Import everything you need from the firebase module
import { auth, db, storage, signIn, signUp, getDocument, uploadFile } from '@/firebase';
```

## 🔐 Authentication

### Sign Up a New User

```typescript
import { signUp } from '@/firebase';

const handleSignUp = async () => {
  try {
    const user = await signUp('user@example.com', 'password123', 'John Doe');
    console.log('User created:', user);
  } catch (error) {
    console.error('Sign up failed:', error);
  }
};
```

### Sign In with Email/Password

```typescript
import { signIn } from '@/firebase';

const handleSignIn = async () => {
  try {
    const user = await signIn('user@example.com', 'password123');
    console.log('Signed in:', user);
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};
```

### Sign In with Google

```typescript
import { signInWithGoogle } from '@/firebase';

const handleGoogleSignIn = async () => {
  try {
    const user = await signInWithGoogle();
    console.log('Signed in with Google:', user);
  } catch (error) {
    console.error('Google sign in failed:', error);
  }
};
```

### Sign Out

```typescript
import { logOut } from '@/firebase';

const handleSignOut = async () => {
  try {
    await logOut();
    console.log('Signed out successfully');
  } catch (error) {
    console.error('Sign out failed:', error);
  }
};
```

### Listen to Auth State Changes

```typescript
import { onAuthChange } from '@/firebase';
import { useEffect } from 'react';

const MyComponent = () => {
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        console.log('User is signed in:', user);
      } else {
        console.log('User is signed out');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);
};
```

### Reset Password

```typescript
import { resetPassword } from '@/firebase';

const handleResetPassword = async () => {
  try {
    await resetPassword('user@example.com');
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Password reset failed:', error);
  }
};
```

## 📊 Firestore Database

### Add a Document

```typescript
import { addDocument } from '@/firebase';

const createCar = async () => {
  try {
    const car = await addDocument('cars', {
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      pricePerDay: 50,
      available: true
    });
    console.log('Car created:', car);
  } catch (error) {
    console.error('Failed to create car:', error);
  }
};
```

### Get a Single Document

```typescript
import { getDocument } from '@/firebase';

const getCar = async (carId: string) => {
  try {
    const car = await getDocument('cars', carId);
    console.log('Car:', car);
  } catch (error) {
    console.error('Failed to get car:', error);
  }
};
```

### Get All Documents

```typescript
import { getDocuments } from '@/firebase';

const getAllCars = async () => {
  try {
    const cars = await getDocuments('cars');
    console.log('All cars:', cars);
  } catch (error) {
    console.error('Failed to get cars:', error);
  }
};
```

### Get Documents with Query

```typescript
import { getDocuments, where, orderBy, limit } from '@/firebase';

const getAvailableCars = async () => {
  try {
    const cars = await getDocuments(
      'cars',
      where('available', '==', true),
      orderBy('pricePerDay', 'asc'),
      limit(10)
    );
    console.log('Available cars:', cars);
  } catch (error) {
    console.error('Failed to get available cars:', error);
  }
};
```

### Update a Document

```typescript
import { updateDocument } from '@/firebase';

const updateCar = async (carId: string) => {
  try {
    const updatedCar = await updateDocument('cars', carId, {
      pricePerDay: 60,
      available: false
    });
    console.log('Car updated:', updatedCar);
  } catch (error) {
    console.error('Failed to update car:', error);
  }
};
```

### Delete a Document

```typescript
import { deleteDocument } from '@/firebase';

const deleteCar = async (carId: string) => {
  try {
    await deleteDocument('cars', carId);
    console.log('Car deleted');
  } catch (error) {
    console.error('Failed to delete car:', error);
  }
};
```

## 📁 Storage (File Uploads)

### Upload a Single File

```typescript
import { uploadFile } from '@/firebase';

const handleFileUpload = async (file: File) => {
  try {
    const url = await uploadFile(file, `cars/${file.name}`);
    console.log('File uploaded:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Upload with Progress Tracking

```typescript
import { uploadFile } from '@/firebase';
import { useState } from 'react';

const FileUploader = () => {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    try {
      const url = await uploadFile(
        file, 
        `cars/${file.name}`,
        (progress) => setProgress(progress)
      );
      console.log('Upload complete:', url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return <div>Upload Progress: {progress}%</div>;
};
```

### Upload Multiple Files

```typescript
import { uploadMultipleFiles } from '@/firebase';

const handleMultipleUploads = async (files: File[]) => {
  try {
    const urls = await uploadMultipleFiles(files, 'cars');
    console.log('All files uploaded:', urls);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Get File URL

```typescript
import { getFileURL } from '@/firebase';

const getCarImage = async (imagePath: string) => {
  try {
    const url = await getFileURL(imagePath);
    console.log('Image URL:', url);
  } catch (error) {
    console.error('Failed to get image URL:', error);
  }
};
```

### Delete a File

```typescript
import { deleteFile } from '@/firebase';

const deleteCarImage = async (imagePath: string) => {
  try {
    await deleteFile(imagePath);
    console.log('File deleted');
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
};
```

### List Files in a Directory

```typescript
import { listFiles } from '@/firebase';

const listCarImages = async () => {
  try {
    const files = await listFiles('cars');
    console.log('Car images:', files);
  } catch (error) {
    console.error('Failed to list files:', error);
  }
};
```

## 🎯 Common Use Cases

### Complete User Registration Flow

```typescript
import { signUp, addDocument } from '@/firebase';

const registerUser = async (email: string, password: string, userData: any) => {
  try {
    // Create auth user
    const user = await signUp(email, password, userData.name);
    
    // Store additional user data in Firestore
    await addDocument('users', {
      uid: user.uid,
      email: user.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address
    });
    
    console.log('User registered successfully');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Create a Booking with Image Upload

```typescript
import { addDocument, uploadFile, getCurrentUser } from '@/firebase';

const createBooking = async (carId: string, bookingData: any, licenseImage: File) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Upload license image
    const licenseUrl = await uploadFile(
      licenseImage, 
      `licenses/${user.uid}/${licenseImage.name}`
    );
    
    // Create booking document
    const booking = await addDocument('bookings', {
      carId,
      userId: user.uid,
      userEmail: user.email,
      licenseUrl,
      ...bookingData
    });
    
    console.log('Booking created:', booking);
    return booking;
  } catch (error) {
    console.error('Booking failed:', error);
    throw error;
  }
};
```

## 🔒 Security Rules

Make sure to configure Firebase Security Rules in the Firebase Console:

### Firestore Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read cars, only admins can write
    match /cars/{carId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can only access their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Storage Rules Example
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folder
    match /licenses/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Car images can be read by anyone, written by admins
    match /cars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📝 Best Practices

1. **Always handle errors** - Use try-catch blocks for all Firebase operations
2. **Validate user input** - Never trust client-side data
3. **Use TypeScript** - Type your data structures for better code quality
4. **Optimize queries** - Use indexes and limit results
5. **Secure your rules** - Never allow unrestricted read/write access
6. **Clean up listeners** - Always unsubscribe from real-time listeners
7. **Use environment variables** - Store sensitive config in `.env` files (for production)

## 🆘 Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/email-already-in-use)"**
   - The email is already registered. Use sign in instead.

2. **"Firebase: Error (auth/wrong-password)"**
   - Incorrect password. Check credentials or use password reset.

3. **"Missing or insufficient permissions"**
   - Check your Firestore security rules in Firebase Console.

4. **"Storage: Object does not exist"**
   - The file path is incorrect or the file was deleted.

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**Need help?** Check the Firebase Console for logs and error messages.
