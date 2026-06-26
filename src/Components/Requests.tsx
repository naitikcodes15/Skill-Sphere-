import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    writeBatch, 
    serverTimestamp
} from 'firebase/firestore';

interface FriendRequest {
  id: string;
  username?: string;
  [key: string]: any;
}

const RequestsList: React.FC = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(
            collection(db, 'users', currentUser.uid, 'friends'),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const incomingRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FriendRequest[];
            setRequests(incomingRequests);
        });

        return () => unsubscribe();
    }, []);

    const handleAccept = async (requestingUser: FriendRequest) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const batch = writeBatch(db);

        const myRef = doc(db, 'users', currentUser.uid, 'friends', requestingUser.id);
        const theirRef = doc(db, 'users', requestingUser.id, 'friends', currentUser.uid);

        batch.update(myRef, {
            status: "accepted",
            updatedAt: serverTimestamp()
        });

        batch.update(theirRef, {
            status: "accepted",
            updatedAt: serverTimestamp()
        });

        try {
            await batch.commit();
            console.log("Friendship established");
        } catch (error) {
            console.error("Accept error:", error);
        }
    };

    const handleDecline = async (requestingUser: FriendRequest) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const batch = writeBatch(db);

        const myRef = doc(db, 'users', currentUser.uid, 'friends', requestingUser.id);
        const theirRef = doc(db, 'users', requestingUser.id, 'friends', currentUser.uid);

        batch.delete(myRef);
        batch.delete(theirRef);

        try {
            await batch.commit();
            console.log("Request declined");
        } catch (error) {
            console.error("Decline error:", error);
        }
    };

    return (
        <div className="p-[20px] px-[30px] bg-[#313338] h-full overflow-y-auto">
            <h3 className="text-[12px] font-bold text-[#949ba4] mb-2.5 uppercase m-0">Pending Requests — {requests.length}</h3>
            {requests.length > 0 ? (
                requests.map((req) => (
                    <div key={req.id} className="flex justify-between items-center py-[10px] px-[12px] border-t border-[#3f4147]">
                        <div className="flex items-center gap-[15px]">
                            <div className="w-[38px] h-[38px] rounded-full bg-[#e67e22] text-white flex items-center justify-center font-bold shrink-0">{req.username ? req.username.charAt(0).toUpperCase() : "?"}</div>
                            <span className="font-bold text-[#f2f3f5] text-[1rem] block">{req.username}</span>
                        </div>
                        <div className="flex gap-[10px]">
                            <button 
                                className="w-[40px] h-[40px] rounded-[8px] bg-transparent border-none cursor-pointer flex items-center justify-center text-[1.2rem] text-green-500 transition-colors duration-200 hover:text-[#23a559] hover:bg-[#1e1f22]" 
                                onClick={() => handleAccept(req)}
                                title="Accept"
                            >
                                ✔
                            </button>
                            <button 
                                className="w-[40px] h-[40px] rounded-[8px] bg-transparent border-none cursor-pointer flex items-center justify-center text-[1.2rem] text-red-500 transition-colors duration-200 hover:text-[#f23f42] hover:bg-[#1e1f22]" 
                                onClick={() => handleDecline(req)}
                                title="Decline"
                            >
                                ✖
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-[13px] text-[#b5bac1] font-normal block p-[20px]">No incoming friend requests.</p>
            )}
        </div>
    );
};

export default RequestsList;
