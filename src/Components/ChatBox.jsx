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
        <div className="flex flex-col h-full w-[75%] max-md:w-full bg-[#111b21] text-[#e9edef] overflow-hidden border-l border-[#222e35] max-md:border-none shadow-xl">
            {/* Header */}
            <div className="h-[60px] shrink-0 px-6 flex items-center bg-[#202c33] border-b border-[#222e35] shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                        {selectedUser.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <div className="font-bold text-[#e9edef] text-base">{selectedUser.username}</div>
                        <div className="text-xs text-emerald-500">Online</div>
                    </div>
                </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 max-md:p-4 flex flex-col gap-3 bg-[#0b141a] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#374045] [&::-webkit-scrollbar-thumb]:rounded">
                {messages.map((msg) => {
                    const isMe = msg.senderId === auth.currentUser.uid;
                    return (
                        <div key={msg.id} className={`max-w-[70%] max-md:max-w-[85%] px-4 py-2 rounded-2xl text-[0.95rem] leading-relaxed break-words flex flex-col shadow-sm relative ${isMe ? "self-end bg-[#005c4b] text-[#e9edef] rounded-tr-sm" : "self-start bg-[#202c33] text-[#e9edef] rounded-tl-sm"}`}>
                            <p className="m-0 mb-1">{msg.text}</p>
                            <div className={`text-[10px] self-end flex items-center gap-1 ${isMe ? "text-teal-100/70" : "text-gray-400"}`}>
                                {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                                {isMe && (
                                    <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current text-blue-400 opacity-90"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form className="p-4 max-md:p-3 shrink-0 bg-[#202c33] border-t border-[#222e35]" onSubmit={handleSend}>
                <div className="flex items-center bg-[#2a3942] rounded-full px-4 py-1.5 focus-within:ring-1 focus-within:ring-teal-500/50 transition-all">
                    <input 
                        type="text" 
                        placeholder="Type a message" 
                        className="flex-1 bg-transparent border-none text-[#e9edef] p-2 outline-none text-[0.95rem] placeholder:text-[#8696a0]"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="bg-[#00a884] text-[#111b21] border-none w-10 h-10 ml-2 rounded-full flex items-center justify-center font-bold cursor-pointer transition-all hover:bg-[#00c99e] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" className="fill-current transform translate-x-0.5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chatbox;