import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

const PendingList = () => {
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // "requested" = Outgoing requests sent by you
        const q = query(
            collection(db, 'users', currentUser.uid, 'friends'),
            where('status', '==', 'requested')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPendingRequests(list);
        });

        return () => unsubscribe();
    }, []);

    // Function to cancel an outgoing request
    const cancelRequest = async (targetUserId) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            // Remove from your list
            await deleteDoc(doc(db, 'users', currentUser.uid, 'friends', targetUserId));
            // Remove from their list
            await deleteDoc(doc(db, 'users', targetUserId, 'friends', currentUser.uid));
        } catch (error) {
            console.error("Error canceling request:", error);
        }
    };

    return (
        <div className="p-[20px] px-[30px] bg-[#313338] h-full overflow-y-auto">
            <div className="text-[12px] font-bold text-[#949ba4] mb-2.5 uppercase">OUTGOING — {pendingRequests.length}</div>
            {pendingRequests.length > 0 ? (
                pendingRequests.map((user) => (
                    <div key={user.id} className="flex justify-between items-center py-[12px] px-[16px] cursor-pointer border-t border-[#3f4147] transition-colors duration-200 hover:bg-[#3f4147] hover:rounded-[8px]">
                        <div className="flex items-center gap-[15px]">
                            <div className="w-[38px] h-[38px] rounded-full bg-[#4e5058] text-white flex items-center justify-center font-bold shrink-0">
                                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span className="font-bold text-[#f2f3f5] text-[1rem] block">{user.username}</span>
                        </div>
                        <div className="flex">
                            <button 
                                className="w-[40px] h-[40px] rounded-[8px] bg-transparent border-none cursor-pointer flex items-center justify-center text-[1.2rem] text-[#b5bac1] transition-colors duration-200 hover:text-[#f23f42] hover:bg-[#1e1f22]" 
                                onClick={() => cancelRequest(user.id)}
                                title="Cancel Request"
                            >
                                ✖
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-[13px] text-[#b5bac1] font-normal block p-[20px]">No outgoing requests.</p>
            )}
        </div>
    );
};

export default PendingList;