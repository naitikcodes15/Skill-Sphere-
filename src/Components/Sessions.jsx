import { useState, useEffect } from "react";

const Sessions = ({ setSelectedSessionId, setMode }) => {
    const [sessions, setSessions] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/session?userId=Naitik_Yadav");
                const data = await res.json();
                setSessions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load sessions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    if (loading) return <div className="text-white">LOADING SESSIONS...</div>;

    return (
        <div className="p-4">
            {sessions.length === 0 ? (
                <p className="text-gray-400">No sessions recorded yet.</p>
            ) : (
                sessions.map((s) => (
                    <div
                        key={s._id}
                        onClick={() => { setSelectedSessionId(s._id); setMode("session"); }}
                        className="border border-gray-700 p-4 mb-3 cursor-pointer hover:bg-gray-800 text-white rounded"
                    >
                        <div className="font-bold">Quiz Score: {s.score}/{s.total}</div>
                        <div className="text-sm text-gray-500">
                            {new Date(s.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Sessions;