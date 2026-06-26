import { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { app } from './firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import SignupCard from './Components/SignupCard'
import HomePage from './Pages/HomePage';
import Profile from './Components/Profile';
import Navbar from './Components/Navbar';
import Friends from './Pages/Friends';
import Games from './Pages/Games';
import Quizzes from './Pages/Quizzes';

const auth = getAuth(app);

function Layout() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121212]">
      <Navbar /> 
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/profile", element: <Profile /> },
      { path: "/friends", element: <Friends /> },
      { path: "/quizzes", element: <Quizzes /> },
      { path: "/games", element: <Games /> },
    ]
  }
]);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check for dev bypass in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true') {
      setUser({
        uid: "test-user-123",
        displayName: "TestAgent",
        email: "agent@test.com",
        photoURL: "https://via.placeholder.com/150"
      } as unknown as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  },[]);
  
  if(loading) return <div className="bg-[#121212] h-screen w-screen flex items-center justify-center text-white text-xl font-bold">Loading SkillSphere...</div>;
  
  if(user === null){
    return(
      <div className="w-full min-h-screen bg-[#121212] m-0 p-0 flex flex-col items-center justify-center">
        <SignupCard/>
        <button 
          onClick={() => window.location.href = window.location.pathname + "?dev=true"}
          className="mt-6 text-gray-500 hover:text-[#e67e22] text-xs underline cursor-pointer transition-colors"
        >
          Dev Login Bypass
        </button>
      </div>
    )
  }

  return <RouterProvider router={router} />;
}

export default App;
