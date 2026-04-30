import { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { app } from './firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    setUser({ displayName: "TestAgent", email: "agent@test.com" });
  },[]);
  
  if(user === null){
    return(
      <div className="w-full min-h-screen bg-[#121212] m-0 p-0">
        <SignupCard/>
      </div>
    )
  }

  return <RouterProvider router={router} />;
}

export default App;
