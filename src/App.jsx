import { useState , useEffect } from 'react'
import { BrowserRouter as Router , Routes,Route } from 'react-router-dom';
import { app } from './firebase';
import {getAuth , onAuthStateChanged} from 'firebase/auth';
import SignupCard from './Components/SignupCard'
import HomePage from './Pages/HomePage';
import Profile from './Components/Profile';
import Navbar from './Components/Navbar';

import Friends from './Pages/Friends';
import Games from './Pages/Games';
import Quizzes from './Pages/Quizzes';
const auth = getAuth(app);

function App() {
  const[user,setUser] = useState(null);
  useEffect(() => {
    onAuthStateChanged(auth , (user) => {
      if(user) {
        setUser(user);
        //yes you are logged in
      }
      else{
        setUser(null);

      }
    });
  },[]);
  if(user === null){
    return(
      <div className="w-full min-h-screen bg-[#121212] m-0 p-0">
        <SignupCard/>
      </div>
    )
  }

  return (
   <Router>
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121212]">
      <Navbar /> 
      <main className="flex-1 overflow-hidden">
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/games" element={<Games />} />
        
      </Routes>
      </main>
      </div>
    </Router>
  );
}

export default App;
