import React, { useEffect, useState } from 'react';
import './WordSuccessModal.css';

interface WordSuccessModalProps {
  show: boolean;
  playerName: string;
  words: string; // Changed from 'word' to 'words'
  points: number;
  onClose: () => void;
}

const WordSuccessModal: React.FC<WordSuccessModalProps> = ({ show, playerName, words, points, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Give time for fade-out animation before calling onClose
        setTimeout(onClose, 500); 
      }, 3000); // Modal visible for 3 seconds
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onClose]);

  if (!show && !isVisible) return null; // Don't render if not showing and not in fade-out

  return (
    <div className={`modal-overlay ${isVisible ? 'show' : ''}`}>
      <div className={`modal-content ${isVisible ? 'show' : ''}`}>
        <h2>Word Played!</h2>
        <p><span className="player-name-highlight">{playerName}</span> made the word(s) <span className="word-highlight">"{words}"</span> for <span className="points-highlight">{points}</span> points!</p>
      </div>
    </div>
  );
};

export default WordSuccessModal;
