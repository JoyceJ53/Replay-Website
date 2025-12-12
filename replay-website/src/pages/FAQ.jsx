import React, { useState } from 'react';
import '../styles/FAQ.css';

export default function FAQ() {
  const faqData = [
    { question: "What do I get from choosing Replay?", answer: "You get the ability to choose from multiple way to replay those memories, whether its through video, or scrapbook style. In Scrapbook style you'll be given two formats. One to keep and one to share." },
    { question: "What do I get with Desktop version?", answer: "Insert answer here." },
    { question: "What if I don't like the music that is provided?", answer: "Insert answer here." }
    // Insert more questions as needed
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h1>FAQ Page</h1>
      {faqData.map((item, index) => (
        <div key={index} className="faq-item">
          <button
            className={`faq-question ${openIndex === index ? 'open-text' : ''}`}
            onClick={() => toggleDropdown(index)}
          >
            {item.question}
            <span className={`faq-icon ${openIndex === index ? 'open' : ''}`}>+</span>
          </button>
          <div className={`faq-answer ${openIndex === index ? 'show' : ''}`}>
            {item.answer}
          </div>
        </div>
      ))}
    </div>
  );
}
