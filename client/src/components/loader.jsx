import React, { useEffect, useState } from "react";

const Loader = () => {
  // A list of status messages to cycle through
  const statusMessages = [
    "Connecting to the design studio...",
    "Finding the latest trends...",
    "Selecting top-rated items...",
    "Applying the final touches...",
    "Your exclusive collection is almost ready!"
  ];

  // A curated list of fashion and style quotes
  const quotes = [
    "Fashion is the armor to survive the reality of everyday life. – Bill Cunningham",
    "Style is a way to say who you are without having to speak. – Rachel Zoe",
    "Elegance is when the inside is as beautiful as the outside. – Coco Chanel",
    "Clothes mean nothing until someone lives in them. – Marc Jacobs",
    "Beauty begins the moment you decide to be yourself. – Coco Chanel"
  ];

  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Animate the progress bar over ~30 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; // Stop just before 100 to feel like it's finishing up
        }
        return prev + 1;
      });
    }, 300); // Adjust timing to feel right, e.g., 300ms * 100 = 30 seconds

    // Cycle through status messages
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 3000); // Change status every 3 seconds

    // Cycle through quotes
    const quoteInterval = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 5000); // Change quote every 5 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearInterval(quoteInterval);
    };
  }, [statusMessages.length, quotes.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-[#121212] text-gray-300 p-8 transition-opacity duration-500 animate-fadeIn">
      
      {/* Dynamic Status Text */}
      <p className="text-lg font-semibold text-yellow-400 mb-4 h-6 transition-opacity duration-300">
        {statusMessages[statusIndex]}
      </p>

      {/* The Progress Bar */}
      <div className="w-full max-w-md bg-gray-800 rounded-full h-2.5 mb-8 overflow-hidden">
        <div 
          className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300 ease-linear" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* The quote, displayed more subtly */}
      <p className="text-md text-gray-500 italic max-w-lg mt-4">
        "{quote}"
      </p>
    </div>
  );
};

export default Loader;

