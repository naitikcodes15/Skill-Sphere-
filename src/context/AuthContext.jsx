import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// Import your initialized firebase app from wherever you set it up
// import { app } from '../firebaseConfig'; 

const AuthContext = createContext();

// This is a custom hook so other files can easily grab the user
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Don't render until Firebase checks auth
    const auth = getAuth();

    useEffect(() => {
        // Firebase automatically triggers this when someone logs in or out
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe; // Cleanup
    }, []);

    const value = {
        currentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;