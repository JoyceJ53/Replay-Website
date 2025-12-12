import React, { useState, useRef } from 'react';
import '../styles/Home.css';
import { Link } from 'react-router-dom';
import sampleVideo from '../assets/samplevideo.mp4';

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const videoRef = useRef(null);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      video.classList.remove("paused");
    } else {
      video.pause();
      video.classList.add("paused");
    }
  };

  return (
    <div className="home-hero">



      {/* Future Popup (This popup will be implemented when Video style scrapbooks are added to the website) */}


        {/* {isPopupOpen && (
          <div className="popup" onClick={() => setIsPopupOpen(false)}>
            <div 
              className="popup-content" 
              onClick={(e) => e.stopPropagation()}
            > */}
              {/* <div className="home-popup-options-container"> */}
                {/* <div className="video-style-container">
                  <h1 className="popup-video-logo">▶</h1>
                  <h3 className="popup-video-title">Video Style</h3>
                  <h4 className="popup-video-text">Some words here Some words here</h4>
                  <Link className="popup-video-link" to="/video-style">
                    <button className="popup-video-button">Create Video</button>
                  </Link>
                </div> */}
                {/* <div className="scrapbook-style-container">
                  <h1 className="popup-scrapbook-logo">📖</h1>
                  <h3 className="popup-scrapbook-title">Scrapbook Style</h3>
                  <h4 className="popup-scrapbook-text">Some words here Some words here</h4>
                  <Link className="popup-scrapbook-link" to="/scrapbook-style">
                    <button className="popup-scrapbook-button">Create Scrapbook</button>
                  </Link>
                </div>
                <u className="home-popup-not-for-now" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIsPopupOpen(false)}>Not for now</u>
              </div>
            </div>
          </div>
        )} */}




      <video autoPlay loop muted className="home-video">
        <source src={sampleVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="hero-content">
        <h1 className="home-title">Lets Replay Your Memories</h1>
        <p className="lead">
          Replay lets you relive your memories with beautiful digital scrapbooks - no printing required. Create, save, and share your books, then enjoy them anytime, anywhere on your devices.
        </p>
        <hr />
        <p>Start creating your amazing scrapbooks today!</p>




        {/* Open Popup Button - This button will open the popup after the video style is implemented */}

        {/* <button 
          className="btn-primary" 
          onClick={() => setIsPopupOpen(true)}
        >
          Create Now
        </button> */}

        {/* replace this button with the popup button later */}
        <Link to="/scrapbook-style">
            <button className="btn-primary">Create Now</button>
        </Link>

        
      </div>

      <hr className="demo-vid-hr" />
      <div className="demo-vid-container">
        <div className="demo-video-box">
          <video className="demo-video paused" ref={videoRef} onClick={handleVideoClick}> <source src={sampleVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="demo-vid-text-container">
          <h3 className="demo-vid-text">
          Memories you can pass around the room - without passing a book. Replay makes digital scrapbooks you can flip through on phones, tablets, and computers, and share with family in the tap.
        </h3>
          <Link className="demo-vid-link" to="/FAQ">
            <button className="demo-vid-button">FAQ</button>
          </Link>
        </div>
      </div>




          {/* This is a future section for reviews - (This should be implemented after people purchase and review the website. You might want to implement a map here to make it easier) */}


      <hr className="reviews-hr" />
      {/* <div className="reviews-container">
        <div className="review-card">
          <h1 className="review-name">Reviewer Name</h1>
          <div className="review-stars">⭐⭐⭐⭐⭐</div>
          <h3 className="review-text">
            review text here review text here review text here review text here review text here review text here review text here
          </h3>
        </div>
        <div className="review-card">
          <h1 className="review-name">Reviewer Name</h1>
          <div className="review-stars">⭐⭐⭐⭐⭐</div>
          <h3 className="review-text">
            review text here review text here review text here review text here review text here review text here review text here
          </h3>
        </div>
        <div className="review-card">
          <h1 className="review-name">Reviewer Name</h1>
          <div className="review-stars">⭐⭐⭐⭐⭐</div>
          <h3 className="review-text">
            review text here review text here review text here review text here review text here review text here review text here
          </h3>
        </div>
      </div> */}
    </div>
  );
}
