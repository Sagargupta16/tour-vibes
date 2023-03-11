import React from 'react';
import Navbar from './components/Navbar/navbar';
import Journal from './pages/journal';
import Signinup from './pages/signinup.jsx';

function App() {
  const data = [
    {
      title: "My First Journal",
      date: "2021-01-01",
      content: "This is my first journal",
      image:
        "https://images.unsplash.com/photo-1610078988881-8b1b1b1b1b1b?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    },
    {
      title: "My Second Journal",
      date: "2021-01-02",
      content: "This is my second journal",
      image:
        "https://images.unsplash.com/photo-1610078988881-8b1b1b1b1b1b?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    },
  ];
  return (
    <div className="App">
      <Navbar/>
      {/* <Journal data={data} title={"My Blogs"}/>
      <Journal data={data} title={"Feeds"}/>
      <Journal data={data} title={"My Favourites"}/> */}
      <Signinup/>
    </div>
  );
}

export default App;