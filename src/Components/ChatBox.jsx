import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp 
} from 'firebase/firestore';

const Chatbox = ({ selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();

    const chatId = auth.currentUser.uid > selectedUser.id 
        ? `${auth.currentUser.uid}_${selectedUser.id}` 
        : `${selectedUser.id}_${auth.currentUser.uid}`;

    useEffect(() => {
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            text: newMessage,
            senderId: auth.currentUser.uid,
            timestamp: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, "chats", chatId, "messages"), messageData);
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full w-[75%] max-md:w-full bg-[#313338] text-[#dcddde] overflow-hidden border-2 border-white max-md:border-none">
            <div className="h-[50px] shrink-0 px-4 flex items-center border-b border-[#26272d] bg-[#313338] font-bold">@{selectedUser.username}</div>
            
            <div className="flex-1 overflow-y-auto p-5 max-md:py-[15px] max-md:px-[10px] flex flex-col gap-2.5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#1e1f22] [&::-webkit-scrollbar-thumb]:rounded">
                {messages.map((msg) => (
                    <div key={msg.id} className={`max-w-[70%] max-md:max-w-[85%] px-3.5 py-2.5 rounded-lg text-[0.95rem] max-md:text-[0.9rem] leading-[1.4] break-words ${msg.senderId === auth.currentUser.uid ? "self-end bg-[#5865f2] text-white" : "self-start bg-[#2b2d31] text-[#dcddde]"}`}>
                        <p className="m-0">{msg.text}</p>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form className="p-5 max-md:p-2.5 shrink-0 bg-[#313338]" onSubmit={handleSend}>
                <div className="flex items-center bg-[#383a40] rounded-lg px-2.5">
                    <input 
                        type="text" 
                        placeholder={`Message @${selectedUser.username}`} 
                        className="flex-1 bg-transparent border-none text-[#dcddde] p-3 outline-none text-base"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="bg-[#e67e22] text-white border-none py-2 px-4 max-md:px-3 max-md:text-[0.85rem] rounded font-bold cursor-pointer transition-opacity duration-200 hover:opacity-90">Send</button>
                </div>
            </form>
        </div>
    );
};

export default Chatbox;