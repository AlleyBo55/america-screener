import { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, push, onDisconnect, set, serverTimestamp } from 'firebase/database';

export function useFirebasePresence() {
    const [count, setCount] = useState<number>(1);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Check if configuration exists and database is initialized
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !database) {
            console.warn("Firebase configuration missing or database not initialized. Visitor count defaulting to 1.");
            return;
        }

        try {
            // References
            const connectedRef = ref(database, '.info/connected');
            const connectionsRef = ref(database, 'connections');

            const unsubscribe = onValue(connectedRef, (snap) => {
                if (snap.val() === true) {
                    setConnected(true);
                    // We're connected (or reconnected)! Do setup.

                    // Create a reference to this user's connection
                    const con = push(connectionsRef);

                    // When I disconnect, remove this connection
                    onDisconnect(con).remove();

                    // Add this device to my connections list
                    // We use set(con, true) or set(con, serverTimestamp())
                    set(con, {
                        start: serverTimestamp(),
                        ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
                    });
                } else {
                    setConnected(false);
                }
            });

            // Listen to the count of connections
            const countUnsubscribe = onValue(connectionsRef, (snap) => {
                if (snap.exists()) {
                    setCount(snap.size);
                } else {
                    setCount(1);
                }
            });

            return () => {
                unsubscribe();
                countUnsubscribe();
            };
        } catch (e) {
            console.error("Error setting up Firebase listeners:", e);
            setConnected(false);
        }
    }, []);

    return { count, connected };
}
