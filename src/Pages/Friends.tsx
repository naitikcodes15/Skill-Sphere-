import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    writeBatch,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import AllList from '../Components/All';
import RequestsList from '../Components/Requests';
import PendingList from '../Components/Pending';
import OnlineList from '../Components/Online';
import AddFriend from '../Components/AddFriend';
import ChatBox from '../Components/ChatBox';
import ProfileView from '../Components/ProfileView';

export interface Friend {
    id: string;
    username: string;
    status: string;
    updatedAt?: any;
}

const Friends: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('chat');
    const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
    const [searchName, setSearchName] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);
    const [friendsList, setFriendsList] = useState<Friend[]>([]);

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'users', auth.currentUser.uid, 'friends'),
            where('status', '==', 'accepted')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const friends = snapshot.docs.map(doc => ({
                id: doc.id,
                username: doc.data().username || "",
                status: doc.data().status || "",
                ...doc.data()
            })) as Friend[];
            setFriendsList(friends);
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = async () => {
        const term = searchName.trim();
        if (!term || !auth.currentUser) return;

        try {
            const q = query(collection(db, "users"), where("username", "==", term));
            const querySnapshot = await getDocs(q);
            const usersFound: any[] = [];

            querySnapshot.forEach((doc) => {
                if (doc.id !== auth.currentUser?.uid) {
                    usersFound.push({ id: doc.id, ...doc.data() });
                }
            });

            setResults(usersFound);
            if (activeTab !== 'add') setActiveTab('add');
        } catch (error) {
            console.error("Search Error:", error);
        }
    };

    const addFriend = async (targetUser: any) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
            const myUsername = currentUserDoc.exists() ? currentUserDoc.data().username : "Unknown User";

            const batch = writeBatch(db);
            const senderRef = doc(db, 'users', currentUser.uid, 'friends', targetUser.id);
            const receiverRef = doc(db, 'users', targetUser.id, 'friends', currentUser.uid);

            batch.set(senderRef, {
                username: targetUser.username,
                status: "requested",
                updatedAt: serverTimestamp()
            });

            batch.set(receiverRef, {
                username: myUsername,
                status: "pending",
                updatedAt: serverTimestamp()
            });

            await batch.commit();
            alert(`Request sent to @${targetUser.username}`);
            setResults([]);
            setSearchName('');
            setActiveTab('pending');
        } catch (error) {
            console.error("Error establishing friend connection:", error);
            alert("Failed to send request.");
        }
    };

    return (
        <div className="flex h-full w-full bg-[#313338] text-[#dcddde] overflow-hidden font-sans">
            <aside className="w-[240px] bg-[#2b2d31] flex flex-col shrink-0">
                <div className="p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                    <input type="text" placeholder="Find or start a conversation" className="w-full bg-[#1e1f22] text-[#dcddde] border-none rounded p-1.5 text-[0.85rem] outline-none placeholder-[#87898c]" />
                </div>
                <div className="pt-4 px-4 pb-1 text-[#949ba4] text-[11px] font-bold tracking-[0.5px]">DIRECT MESSAGES</div>
                <div className="flex-1 overflow-y-auto px-2 mt-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#1a1b1e] [&::-webkit-scrollbar-thumb]:rounded">
                    {friendsList.map(friend => (
                        <div
                            key={friend.id}
                            className={`flex items-center gap-3 py-1.5 px-2 rounded cursor-pointer mb-[2px] transition-colors duration-200 text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] ${selectedUser?.id === friend.id && activeTab === 'chat' ? 'bg-[#404249] text-white' : ''}`}
                            onClick={() => {
                                setSelectedUser(friend);
                                setActiveTab('chat');
                            }}
                        >
                            <div className="w-[32px] h-[32px] rounded-full bg-[#5865f2] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {friend.username ? friend.username.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span>{friend.username}</span>
                        </div>
                    ))}
                    {friendsList.length === 0 && <p className="text-center text-[#949ba4] mt-5 text-[0.9rem] italic">No friends yet.</p>}
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-[#313338] min-w-0">
                <header className="h-[48px] px-4 flex items-center justify-between border-b border-[#1f2023] shrink-0 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center text-white mr-2 cursor-pointer transition-colors duration-200 hover:text-[#dbdee1]" onClick={() => setActiveTab('all')}>👤 Friends</span>
                        <button className={`bg-transparent border-none text-base cursor-pointer px-2 py-0.5 rounded transition-colors duration-200 hover:bg-[#3f4147] hover:text-[#dbdee1] ${activeTab === 'online' ? 'bg-[#404249] text-white' : 'text-[#80848e]'}`} onClick={() => setActiveTab('online')}>Online</button>
                        <button className={`bg-transparent border-none text-base cursor-pointer px-2 py-0.5 rounded transition-colors duration-200 hover:bg-[#3f4147] hover:text-[#dbdee1] ${activeTab === 'all' ? 'bg-[#404249] text-white' : 'text-[#80848e]'}`} onClick={() => setActiveTab('all')}>All</button>
                        <button className={`bg-transparent border-none text-base cursor-pointer px-2 py-0.5 rounded transition-colors duration-200 hover:bg-[#3f4147] hover:text-[#dbdee1] ${activeTab === 'pending' ? 'bg-[#404249] text-white' : 'text-[#80848e]'}`} onClick={() => setActiveTab('pending')}>Pending</button>
                        <button className={`bg-transparent border-none text-base cursor-pointer px-2 py-0.5 rounded transition-colors duration-200 hover:bg-[#3f4147] hover:text-[#dbdee1] ${activeTab === 'requests' ? 'bg-[#404249] text-white' : 'text-[#80848e]'}`} onClick={() => setActiveTab('requests')}>Requests</button>
                        <button className="bg-[#248046] text-white border-none py-1 px-2 rounded font-bold ml-2 cursor-pointer transition-colors duration-200 hover:bg-[#1a6334]" onClick={() => setActiveTab('add')}>Add Friend</button>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Search username"
                            className="bg-[#1e1f22] text-[#dcddde] border-none rounded p-1.5 w-[200px] outline-none text-sm placeholder-[#b5bac1]"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {activeTab === 'chat' ? (
                        selectedUser ? (
                            <div className="flex-1 flex min-w-0">
                                <ChatBox selectedUser={selectedUser} />
                                <ProfileView userId={selectedUser.id} />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[#949ba4] bg-[#313338] text-lg font-semibold">
                                <p>Select a friend to start chatting!</p>
                            </div>
                        )
                    ) : (
                        <div className="flex-1 overflow-y-auto w-full p-0">
                            {activeTab === 'online' && <OnlineList onSelect={setSelectedUser} />}
                            {activeTab === 'all' && <AllList onSelect={setSelectedUser} setActiveTab={setActiveTab} />}
                            {activeTab === 'pending' && <PendingList onSelect={setSelectedUser} />}
                            {activeTab === 'requests' && <RequestsList onSelect={setSelectedUser} />}
                            {activeTab === 'add' && (
                                <AddFriend
                                    onSearch={handleSearch}
                                    searchResults={results}
                                    onAddFriend={addFriend}
                                    setSearchName={setSearchName}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Friends;
