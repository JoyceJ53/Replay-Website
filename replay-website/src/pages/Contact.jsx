import React from 'react';
import '../styles/Contact.css';

export default function Contact() {
  return (
    <div className="contact-hero">
      <h2 className="contact-title">Let us know what we can do to improve your experience!</h2>
      <p className="contact-email">Email</p>
      <input className="contact-email-input" type="email" placeholder="Email" />
      <p className="contact-subject">Subject</p>
      <input className="contact-subject-input" type="text" placeholder="Subject" />
      <p className="contact-message">Message</p>
      <textarea className="contact-message-input" placeholder="Message"></textarea>
      <button className="contact-submit-button">Submit</button>
    </div>
  );
}
