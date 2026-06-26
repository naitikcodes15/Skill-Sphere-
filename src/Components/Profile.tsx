import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ProfileView from './ProfileView';

interface ProfileFormData {
  name: string;
  username: string;
  age: string | number;
  gender: string;
  homeCity: string;
  collegeName: string;
  degree: string;
  branch: string;
  year: string | number;
  about: string;
}

const Profile: React.FC = () => {
  const [isExistingUser, setIsExistingUser] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '', username: '', age: '', gender: '', homeCity: '',
    collegeName: '', degree: '', branch: '', year: '', about: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data() as ProfileFormData);
          setIsExistingUser(true);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    if (!user) {
      alert("⚠️ Dev Bypass Mode: Profile data cannot be saved to the database without a real Google Login.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), formData);
      setIsExistingUser(true);
      setIsEditing(false);
      alert(isExistingUser ? "Profile Updated!" : "Profile Saved!");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="w-full h-full bg-[#121212] flex justify-center items-center p-2.5 box-border">
      {isEditing ? (
        <div className="bg-[#1e1e1e] w-full max-w-[450px] p-5 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 className="text-[#e67e22] text-[1.4rem] font-extrabold mb-[15px] text-center m-0 pb-4">
            {isExistingUser ? "Update Profile" : "Setup Profile"}
          </h2>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2.5 mb-1">
              <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Name</label>
                <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
              </div>
               <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Username</label>
                <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Your Username" required />
              </div>
              <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Age</label>
                <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" />
              </div>
              <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Gender</label>
                <select className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Home City</label>
                <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="text" name="homeCity" value={formData.homeCity} onChange={handleChange} placeholder="City" />
              </div>
            </div>

            <div className="mb-2.5">
              <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">College Name</label>
              <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="Enter College" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-1">
              <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Degree</label>
                <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. B.Tech" />
              </div>
              <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Branch</label>
                <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g. CSE" />
              </div>
              <div className="mb-2.5">
                <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">Year</label>
                <input className="w-full p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border" type="number" name="year" value={formData.year} onChange={handleChange} placeholder="Current Year" />
              </div>
            </div>

            <div className="mb-2.5">
              <label className="block font-semibold text-[#b5bac1] mb-[3px] text-[0.75rem]">About College</label>
              <textarea className="w-full h-[60px] p-[6px_10px] bg-[#2b2d31] border border-[#3f4147] text-white rounded-[6px] text-[0.85rem] outline-none focus:border-blue-500 box-border resize-y" name="about" value={formData.about} onChange={handleChange} placeholder="Tell us about your campus..."></textarea>
            </div>

            <button type="submit" className="w-full bg-[#e67e22] text-white p-2.5 border-none rounded-[6px] text-[0.9rem] font-bold cursor-pointer mt-2.5 hover:bg-[#d35400] transition-colors duration-200">
              {isExistingUser ? "Save Changes" : "Save Profile"}
            </button>
            
            {isExistingUser && (
              <button type="button" className="w-full bg-[#4e5058] text-white p-2.5 border-none rounded-[6px] text-[0.9rem] font-bold cursor-pointer mt-2.5 hover:bg-[#3f4147] transition-colors duration-200" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            )}
          </form>
        </div>
      ) : (
        <ProfileView data={formData} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

export default Profile;
