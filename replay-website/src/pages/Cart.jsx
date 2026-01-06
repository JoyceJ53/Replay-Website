import React from 'react';
import '../styles/Cart.css';

export default function PurchasePage() {
  
  // Make a const here that has a purchase confirmation popup

  return (
    <div className="cart-hero">
      {/* Billing & Payment Information */}
      <div className="left-container">
        <div className="billing-info-container">
          <h3 className="purchase-title">Billing information</h3>
          <p className="purchase-info-subtitles">First Name</p>
          <p className="purchase-info-subtitles">Last Name</p>
          <input className="purchase-inputs" type="text" name="firstname" placeholder="Enter your first name"></input>
          <input className="purchase-inputs" type="text" name="lastname" placeholder="Enter your last name"></input>
          <p className="purchase-info-subtitles-address">Street Address, Company Name, or P.O. Box</p>
          <input className="purchase-input-address" type="text" name="address" placeholder="Enter your street address"></input>
          <p className="purchase-info-subtitles-apt">Apt, Suite, Building etc. (optional)</p>
          <input className="purchase-input-apt" type="text" name="apt" placeholder="Enter your apt, suite, building (optional)"></input>
          <p className="purchase-info-subtitles">City</p>
          <p className="purchase-info-subtitles">State</p>
          <input className="purchase-inputs" type="text" name="city" placeholder="Enter your city"></input>
          <input className="purchase-inputs" type="text" name="state" placeholder="Enter your state"></input>
          <p className="purchase-info-subtitles">Zip Code</p>
          <p className="purchase-info-subtitles">Country</p>
          <input className="purchase-inputs" type="text" name="zip-code" placeholder="Enter your zip code"></input>
          <input className="purchase-inputs" type="text" name="country" placeholder="Enter your country"></input>
        </div>
        <div className="payment-info-container">
          <h3 className="purchase-title">Payment information</h3>
          <p className="purchase-info-subtitles-card-holder">Card holder Name</p>
          <input className="purchase-input-card-holder" type="text" name="card-holder-name" placeholder="Enter the card holder name"></input>
          <p className="purchase-info-subtitles-card-num">Card Number</p>
          <input className="purchase-input-card-num" type="text" name="card-number" placeholder="Enter the card number"></input>
          <p className="purchase-info-subtitles">Expiration Date</p>
          <p className="purchase-info-subtitles">CVV</p>
          <input className="purchase-inputs" type="text" name="expiration-date" placeholder="Enter the expiration date"></input>
          <input className="purchase-inputs" type="text" name="cvv" placeholder="Enter the CVV"></input>
        </div>
      </div>
      <div className="right-container">
        <div className="cart-items-container">
          <h3 className="purchase-info-subtitles">Cart</h3>
          {/* Put a map here for the stuff in the cart */}
        </div>
        <div className="purchase-total-box">
          <h4 className="subtotal-text">Subtotal:</h4>
          <h4 className="tax-text">Tax:</h4>
          <h4 className="total-text">Total:</h4>
          <button className="purchase-popup-button">Purchase</button>
        </div>
        <div className="no-subscription-box">
          <h2 className="cart-add-subscription-title">Replay Cloud</h2>
          <h4 className="cart-add-subscription-text"> ● Cloud backup for your books on any device<br /> ● Upload & access your books on any device<br /> ● Family sharing</h4>
          <button className="cart-add-subscription-button">Subscribe for $10/year</button>
          <p className="cart-add-subscription-terms">By subscribing, you agree to the Terms & Privacy Policy.</p>
        </div>
        {/* <div className="purchase-popup-confirmation">
          {/* PURCHASE CONFIRMATION POPUP
        </div> */}
        {/* WE ALSO NEED A REPLAY CLOUD "ADD TO CART" POPUP */}
      </div>
    </div>
    
    // Add "thanks for your purchase" here
  );
}
