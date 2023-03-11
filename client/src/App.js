import React from 'react';
import Navbar from './components/Navbar/navbar';
import Myjournal from './pages/myjournal.jsx';
import Feed from './pages/feed.jsx';
import Favorites from './pages/favorites.jsx';
import Signin from './pages/signin.jsx';
import Signup from './pages/signup.jsx';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Myjournal/>
      <Feed/>
      <Favorites/>
      <Signin/>
      <Signup/>
    </div>
  );
}

export default App;