import React from "react";
import "./Home.css";
import video from "./video.mp4";
const Home = () => {
  return (
    <section className="home">
      <div className="overlay"> </div>
      <video src={video} muted autoPlay loop type="video/mp4"></video>

      <div className="homeContent container">
        <div className="textDiv">
          <span className="smallText">Bonjour!</span>
          <h1 className="homeTitle">
            Once a year go someplace you've never been before
          </h1>
          <span className="authorText">-Dalai Lama</span>
        </div>
      </div>
    </section>
  );
};

export default Home;
