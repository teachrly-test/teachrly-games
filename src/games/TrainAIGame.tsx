import React, { useState, useEffect, useRef } from 'react';

// Audio helper functions
const playAudio = (audioPath: string, volume: number = 0.5) => {
  try {
    const audio = new Audio(audioPath);
    audio.volume = volume;
    audio.play().catch(error => {
      console.log('Audio play failed:', error);
    });
  } catch (error) {
    console.log('Audio creation failed:', error);
  }
};

// Specific audio functions (removing unused ones for now)
const playCorrectSound = () => playAudio('/audio/correct-ding.mp3', 0.7);
const playWrongSound = () => playAudio('/audio/wrong-buzz.mp3', 0.5);
const playThinkingSound = () => playAudio('/audio/thinking-beep.mp3', 0.3);

const TrainAIGame: React.FC<{onBackToMenu?: () => void}> = ({ onBackToMenu }) => {
  // Pet pictures data with AI response logic
  const allPetPictures = [
    { id: 1, type: 'cat', emoji: '🐱', name: 'Cat 1', aiGuess: 'cat' },
    { id: 2, type: 'cat', emoji: '🐈', name: 'Cat 2', aiGuess: 'dog' },
    { id: 3, type: 'dog', emoji: '🐶', name: 'Dog 1', aiGuess: 'dog' },
    { id: 4, type: 'dog', emoji: '🐕', name: 'Dog 2', aiGuess: 'cat' },
  ];

  const [availablePets, setAvailablePets] = useState(allPetPictures);
  const [draggedPet, setDraggedPet] = useState<any>(null);
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  const [gamePhase] = useState<'training'>('training'); // Simplified for testing
  const [wrongAttempts, setWrongAttempts] = useState<{[key: number]: number}>({});
  const [completedPets, setCompletedPets] = useState(0);
  const [isDragBlocked, setIsDragBlocked] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Mobile touch drag and drop support
  const [touchDragPet, setTouchDragPet] = useState<any>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPosition, setDragPosition] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  
  // Refs for touch event management
  const petCardRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fixed touch handlers - remove preventDefault calls and use proper event management
  const handleTouchStart = (pet: any, touch: Touch) => {
    if (currentMessage || isDragBlocked) {
      return;
    }
    
    console.log('Touch start for:', pet.name);
    setTouchDragPet(pet);
    setIsDragging(true);
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    
    // Use CSS and body styles to prevent scrolling instead of preventDefault
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchDragPet || !isDragging) return;
    
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchDragPet || !isDragging) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    console.log('Touch ended at:', { x: touch.clientX, y: touch.clientY });
    console.log('Element below:', elementBelow);
    
    // Find the chat area (drop zone)
    const chatArea = elementBelow?.closest('.chat-area');
    if (chatArea && gamePhase === 'training' && !isDragBlocked && !currentMessage) {
      // Successfully dropped in chat area
      console.log('Successfully dropped in chat area!');
      
      // Immediately show the pet in the chat
      setCurrentMessage({
        type: 'pet-dropped',
        text: 'Let me take a look at this...',
        pet: touchDragPet
      });
      
      // Process the drop after a brief moment
      setTimeout(() => {
        processPetDrop(touchDragPet);
      }, 800);
    } else {
      console.log('Drop failed - not in chat area');
    }
    
    // Reset state
    setIsDragging(false);
    setTouchDragPet(null);
    setDragPosition({ x: 0, y: 0 });
    
    // Re-enable page scrolling - restore all properties
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  };

  // Use useEffect to add non-passive event listeners for mobile touch
  useEffect(() => {
    if (!isMobile) return;

    const addTouchListeners = (element: HTMLDivElement, pet: any) => {
      const startHandler = (e: TouchEvent) => {
        handleTouchStart(pet, e.touches[0]);
      };
      
      // Add non-passive listeners
      element.addEventListener('touchstart', startHandler, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        element.removeEventListener('touchstart', startHandler);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    };

    const cleanupFunctions: (() => void)[] = [];
    
    availablePets.forEach(pet => {
      const element = petCardRefs.current[pet.id];
      if (element) {
        cleanupFunctions.push(addTouchListeners(element, pet));
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [availablePets, isMobile, currentMessage, isDragBlocked, touchDragPet, isDragging]);

  // Unified drop processing for both desktop and mobile
  const processPetDrop = (pet: any) => {
    setIsDragBlocked(true);
    
    setAvailablePets(prev => prev.filter(p => p.id !== pet.id));
    
    // Play subtle thinking sound
    playThinkingSound();
    
    setCurrentMessage({
      type: 'thinking',
      text: 'AI is thinking...',
      pet: pet
    });

    setTimeout(() => {
      const aiResponse = `That is a ${pet.aiGuess}!`;
      setCurrentMessage({
        type: 'ai-response',
        text: aiResponse,
        pet: pet
      });
    }, 1000);
  };

  const handleDragStart = (pet: any) => {
    if (currentMessage || isDragBlocked) {
      return;
    }
    setDraggedPet(pet);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedPet && gamePhase === 'training' && !isDragBlocked && !currentMessage) {
      processPetDrop(draggedPet);
      setDraggedPet(null);
    }
  };

  const handleFeedback = (userAnswer: 'yes' | 'no') => {
    const pet = currentMessage.pet;
    const aiWasCorrect = pet.type === pet.aiGuess;
    const userIsCorrect = (userAnswer === 'yes' && aiWasCorrect) || (userAnswer === 'no' && !aiWasCorrect);

    if (userIsCorrect) {
      playCorrectSound();
      
      const newCompletedCount = completedPets + 1;
      const isLastPet = newCompletedCount === 4;
      
      setCurrentMessage({
        type: 'correct',
        text: 'Correct!'
      });
      
      setCompletedPets(newCompletedCount);
      
      setTimeout(() => {
        setCurrentMessage(null);
        setIsDragBlocked(false);
      }, isLastPet ? 2500 : 1500);
    } else {
      playWrongSound();
      
      const currentAttempts = wrongAttempts[pet.id] || 0;
      const newAttempts = currentAttempts + 1;
      
      setWrongAttempts(prev => ({
        ...prev,
        [pet.id]: newAttempts
      }));

      setAvailablePets(prev => [...prev, pet]);

      const retryMessage = newAttempts >= 2 ? "uhhhhh, try again!" : "I'm not sure the AI got it right… look at the picture and try again";
      
      setCurrentMessage({
        type: 'retry',
        text: retryMessage
      });
      
      setTimeout(() => {
        setCurrentMessage(null);
        setIsDragBlocked(false);
      }, 3000);
    }
  };

  // Main game interface
  return (
    <>
      <style>
        {`
          .game-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .game-content {
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            padding: 2rem;
            width: 100%;
            max-width: 900px;
          }
          .game-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
          }
          .back-to-games-btn {
            padding: 8px 16px;
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.2s;
          }
          .back-to-games-btn:hover {
            background: #4b5563;
          }
          .game-title {
            margin: 0;
            flex: 1;
            text-align: center;
            font-size: 1.8rem;
            font-weight: bold;
            color: #333;
          }
          .header-spacer {
            width: 100px;
          }
          .chat-interface {
            background: #f8fafc;
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 1.5rem;
          }
          .chat-area {
            min-height: 200px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: 2px dashed #e2e8f0;
            border-radius: 16px 16px 0 0;
            background: white;
          }
          .chat-placeholder {
            color: #64748b;
            font-size: 1.1rem;
            text-align: center;
            margin: 0;
          }
          .chat-message {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            width: 100%;
            max-width: 500px;
          }
          .ai-avatar {
            font-size: 2rem;
            flex-shrink: 0;
          }
          .message-content {
            flex: 1;
          }
          .ai-response {
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 12px;
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          .thinking-dots {
            display: flex;
            gap: 4px;
            justify-content: center;
          }
          .thinking-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #667eea;
            animation: thinking 1.4s infinite;
          }
          .thinking-dots span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .thinking-dots span:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes thinking {
            0%, 60%, 100% { transform: scale(1); opacity: 0.7; }
            30% { transform: scale(1.2); opacity: 1; }
          }
          .dragged-pet-display {
            text-align: center;
            margin-bottom: 1rem;
          }
          .pet-emoji-large {
            font-size: 4rem;
          }
          .feedback-section {
            text-align: center;
          }
          .feedback-question {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: #333;
            font-weight: 600;
          }
          .feedback-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          .yes-button, .no-button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .yes-button {
            background: #10b981;
            color: white;
          }
          .yes-button:hover {
            background: #059669;
            transform: translateY(-1px);
          }
          .no-button {
            background: #ef4444;
            color: white;
          }
          .no-button:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }
          .correct-message {
            background: #d1fae5;
            color: #065f46;
            padding: 1rem;
            border-radius: 12px;
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            border: 2px solid #10b981;
          }
          .retry-message {
            background: #fef3c7;
            color: #92400e;
            padding: 1rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
            border: 2px solid #f59e0b;
          }
          .inventory {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 16px;
            border: 2px solid #e2e8f0;
          }
          .inventory-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 1rem;
            text-align: center;
          }
          .pet-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
          .pet-card {
            background: white;
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
            cursor: grab;
            transition: all 0.2s ease;
            border: 2px solid #e2e8f0;
            user-select: none;
            touch-action: none;
          }
          .pet-card:hover:not(.drag-disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            border-color: #667eea;
          }
          .pet-card.drag-disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .pet-emoji {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }
          .pet-name {
            font-size: 0.9rem;
            font-weight: 500;
            color: #64748b;
          }
          .pet-card.being-dragged {
            opacity: 0.3;
            transform: scale(0.9);
          }
          .mobile-drag-preview {
            position: fixed;
            pointer-events: none;
            z-index: 1000;
            transform: translate(-50%, -50%);
            opacity: 0.8;
            background: white;
            padding: 0.5rem;
            border-radius: 8px;
            border: 2px solid #667eea;
            font-size: 0.8rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            text-align: center;
            top: 0;
            left: 0;
            will-change: transform;
          }
          .mobile-drag-preview .drag-emoji {
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
            display: block;
          }
          .mobile-drag-preview .drag-name {
            font-size: 0.7rem;
            color: #64748b;
            font-weight: 500;
            white-space: nowrap;
          }
          .chat-area.drag-over {
            background: #f0f9ff !important;
            border-color: #667eea !important;
            border-style: solid !important;
          }
          .chat-area.drag-over .chat-placeholder {
            color: #667eea !important;
            font-weight: 600 !important;
          }
          
          /* Mobile responsive styles */
          @media (max-width: 768px) {
            .game-container {
              padding: 16px;
              align-items: flex-start;
            }
            .game-content {
              padding: 1.5rem;
              max-width: 100%;
              margin-top: 20px;
            }
            .game-header {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }
            .back-to-games-btn {
              align-self: flex-start;
              padding: 6px 12px;
              font-size: 0.8rem;
            }
            .game-title {
              text-align: center;
              font-size: 1.5rem;
            }
            .header-spacer {
              display: none;
            }
            .chat-area {
              min-height: 150px;
              padding: 1rem;
            }
            .chat-placeholder {
              font-size: 1rem;
            }
            .chat-message {
              max-width: 100%;
            }
            .ai-avatar {
              font-size: 1.5rem;
            }
            .ai-response {
              font-size: 0.9rem;
              padding: 0.75rem;
            }
            .pet-emoji-large {
              font-size: 3rem;
            }
            .feedback-question {
              font-size: 1rem;
            }
            .feedback-buttons {
              flex-direction: column;
              gap: 0.5rem;
            }
            .yes-button, .no-button {
              padding: 10px 20px;
              font-size: 0.9rem;
            }
            .correct-message, .retry-message {
              font-size: 1rem;
              padding: 0.75rem;
            }
            .inventory {
              padding: 1rem;
            }
            .inventory-title {
              font-size: 1rem;
            }
            .pet-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.75rem;
            }
            .pet-card {
              padding: 0.75rem;
            }
            .pet-emoji {
              font-size: 2rem;
            }
            .pet-name {
              font-size: 0.8rem;
            }
          }
          
          @media (max-width: 480px) {
            .game-content {
              padding: 1rem;
            }
            .game-title {
              font-size: 1.25rem;
            }
            .chat-area {
              min-height: 120px;
              padding: 0.75rem;
            }
            .chat-placeholder {
              font-size: 0.9rem;
            }
            .ai-response {
              font-size: 0.8rem;
              padding: 0.5rem;
            }
            .pet-emoji-large {
              font-size: 2.5rem;
            }
            .pet-grid {
              grid-template-columns: 1fr 1fr;
              gap: 0.5rem;
            }
            .pet-card {
              padding: 0.5rem;
            }
            .pet-emoji {
              font-size: 1.5rem;
            }
            .pet-name {
              font-size: 0.7rem;
            }
          }
        `}
      </style>
      <div className="game-container">
        
        {/* Mobile drag preview */}
        {isDragging && touchDragPet && dragPosition.x > 0 && dragPosition.y > 0 && (
          <div 
            className="mobile-drag-preview"
            style={{
              transform: `translate(${dragPosition.x - 50}px, ${dragPosition.y - 50}px)`
            }}
          >
            <div className="drag-emoji">{touchDragPet.emoji}</div>
            <div className="drag-name">{touchDragPet.name}</div>
          </div>
        )}

        <div className="game-content">
          {/* Header with back button */}
          <div className="game-header">
            {onBackToMenu && (
              <button 
                onClick={onBackToMenu} 
                className="back-to-games-btn"
              >
                ← Back
              </button>
            )}
            <h1 className="game-title">
              Train your AI with pets!
            </h1>
            <div className="header-spacer"></div>
          </div>
          
          <div className="chat-interface">
            <div 
              className={`chat-area ${isDragging ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!currentMessage ? (
                <p className="chat-placeholder">
                  {gamePhase === 'training' 
                    ? isDragging 
                      ? "Drop the pet here!" 
                      : isMobile 
                        ? "Tap and drag pictures here to train your AI!" 
                        : "Drag pictures here to train your AI!"
                    : "I want to show you something cool, ask me to create a picture of a dog or a cat!"
                  }
                </p>
              ) : currentMessage.type === 'pet-dropped' ? (
                <div className="chat-message">
                  <div className="ai-avatar">🤖</div>
                  <div className="message-content">
                    <div className="ai-response">Let me take a look at this...</div>
                    <div className="dragged-pet-display">
                      <div className="pet-emoji-large">{currentMessage.pet?.emoji}</div>
                      <div style={{fontSize: '1rem', color: '#64748b', marginTop: '0.5rem'}}>
                        {currentMessage.pet?.name}
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentMessage.type === 'thinking' ? (
                <div className="chat-message">
                  <div className="ai-avatar">🤖</div>
                  <div className="message-content">
                    <div className="ai-response">
                      <div className="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    <div className="dragged-pet-display">
                      <div className="pet-emoji-large">{currentMessage.pet?.emoji}</div>
                    </div>
                  </div>
                </div>
              ) : currentMessage.type === 'correct' ? (
                <div className="correct-message">
                  {currentMessage.text}
                </div>
              ) : currentMessage.type === 'retry' ? (
                <div className="retry-message">
                  {currentMessage.text}
                </div>
              ) : (
                <div className="chat-message">
                  <div className="ai-avatar">🤖</div>
                  <div className="message-content">
                    <div className="ai-response">{currentMessage.text}</div>
                    <div className="dragged-pet-display">
                      <div className="pet-emoji-large">{currentMessage.pet?.emoji}</div>
                    </div>
                    <div className="feedback-section">
                      <p className="feedback-question">Did the AI get it right?</p>
                      <div className="feedback-buttons">
                        <button 
                          className="yes-button"
                          onClick={() => handleFeedback('yes')}
                        >
                          Yes
                        </button>
                        <button 
                          className="no-button"
                          onClick={() => handleFeedback('no')}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {gamePhase === 'training' && (
            <div className="inventory">
              <h3 className="inventory-title">
                Your Pet Pictures:
                {availablePets.length > 0 && ` (${availablePets.length} remaining)`}
              </h3>
              <div className="pet-grid">
                {availablePets.map((pet) => (
                  <div 
                    key={pet.id} 
                    ref={el => { petCardRefs.current[pet.id] = el; }}
                    className={`pet-card ${isDragBlocked || currentMessage ? 'drag-disabled' : ''} ${touchDragPet?.id === pet.id && isDragging ? 'being-dragged' : ''}`}
                    draggable={!isMobile && !isDragBlocked && !currentMessage}
                    onDragStart={() => !isMobile && handleDragStart(pet)}
                  >
                    <div className="pet-emoji">{pet.emoji}</div>
                    <div className="pet-name">{pet.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrainAIGame;