import React from 'react';
import '../styles/Pricing.css';

export default function Pricing() {
  return (
    <div>
      <h1 className="pricing-main-title">How do you want to Replay?</h1>
      <div className="pricing-container">
        <div className="pricing-card">
            <h2 className="pricing-title">Digital Scrapbook</h2>
            <h2 className="pricing-price"><strong>$20</strong></h2>
            <hr />
            <p className="pricing-text">● Download your scrapbook directly to your computer</p>
            <button className="pricing-button">Create</button>
        </div>
        <div className="pricing-card">
            <h2 className="pricing-title">Access to the Cloud</h2>
            <h2 className="pricing-price"><strong>$10</strong>/year</h2>
            <hr />
            <p className="pricing-text">● Cloud backup for your books <br /> ● Upload & access your books on any device <br /> ● Family sharing</p>
            <button className="pricing-button">Create</button>
        </div>
      </div>
    </div>
  );
}
