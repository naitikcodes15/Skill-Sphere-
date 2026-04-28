import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
const HomePage = () => {
  const [fullName, setFullName] = useState("User");
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const fullDisplayName = userDoc.data().name;
          const firstName = fullDisplayName.trim().split(" ")[0];
          setFullName(firstName);
        }
      }
    };
    fetchUser();
  }, []);
  return (
    <div className="h-full w-full flex flex-col bg-[#121212] overflow-hidden text-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-5">
        <h1 className="text-gray-300">Welcome {fullName}</h1>
        <h1 className="text-[clamp(3rem,10vw,5.5rem)] font-black text-[#e67e22] m-0 leading-[1.1] uppercase transition-transform duration-300 hover:scale-105">
          Skill Sphere <br />
        </h1>
        <p className="text-[clamp(1.5rem,4vw,2.2rem)] text-[#95a5a6] mt-5 mb-10 font-normal">Learn • Enjoy • Grow</p>
      </div>
    </div>
  );
};

export default HomePage;