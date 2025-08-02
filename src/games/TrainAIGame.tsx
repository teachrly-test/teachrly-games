import React, { useState, useEffect } from 'react';

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

// Specific audio functions
const playCorrectSound = () => playAudio('/audio/correct-ding.mp3', 0.7);
const playWrongSound = () => playAudio('/audio/wrong-buzz.mp3', 0.5);
const playSuccessSound = () => playAudio('/audio/success.mp3', 0.8);
const playThinkingSound = () => playAudio('/audio/thinking-beep.mp3', 0.3);
const playCatMeow = () => playAudio('/audio/cat-meow.mp3', 0.6);
const playDogBark = () => playAudio('/audio/dog-bark.mp3', 0.6);
const playLillyStart = () => playAudio('/audio/lilly-start.mp3', 0.7);
const playLillyFinal = () => playAudio('/audio/lilly-final.mp3', 0.7);

const TrainAIGame: React.FC<{onBackToMenu?: () => void}> = ({ onBackToMenu }) => {
  // Pet pictures data with AI response logic
  const allPetPictures = [
    { id: 1, type: 'cat', emoji: '🐱', name: 'Cat 1', aiGuess: 'cat' }, // AI guesses correctly
    { id: 2, type: 'cat', emoji: '🐈', name: 'Cat 2', aiGuess: 'dog' }, // AI guesses wrong
    { id: 3, type: 'dog', emoji: '🐶', name: 'Dog 1', aiGuess: 'dog' }, // AI guesses correctly
    { id: 4, type: 'dog', emoji: '🐕', name: 'Dog 2', aiGuess: 'cat' }, // AI guesses wrong
  ];

  const [availablePets, setAvailablePets] = useState(allPetPictures);
  const [draggedPet, setDraggedPet] = useState<any>(null);
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  const [gamePhase, setGamePhase] = useState<'video' | 'loading' | 'training' | 'generation' | 'complete'>('video');
  const [inputText, setInputText] = useState('');
  const [generatedPictures, setGeneratedPictures] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<{[key: number]: number}>({});
  const [completedPets, setCompletedPets] = useState(0);
  const [isDragBlocked, setIsDragBlocked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isShowingFinalResult, setIsShowingFinalResult] = useState(false);

  // Loading component
  const LoadingScreen = () => {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  };

  // Video intro component
  const VideoIntro = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const [instructionsClass, setInstructionsClass] = useState('fade-in');

    const handleVideoError = (e: any) => {
      console.log('Video error:', e);
      console.log('Video error details:', e.target.error);
    };

    const handleVideoLoad = () => {
      console.log('Video loaded successfully!');
    };

    const handleVideoEnded = () => {
      console.log('Video ended, transitioning to game...');
      setGamePhase('loading');
      setTimeout(() => {
        setGamePhase('training');
        // PLAY LILLY START AUDIO when game begins
        playLillyStart();
      }, 500);
    };

    const handleSkipVideo = () => {
      console.log('Video skipped, transitioning to game...');
      setGamePhase('loading');
      setTimeout(() => {
        setGamePhase('training');
        // PLAY LILLY START AUDIO when game begins
        playLillyStart();
      }, 500);
    };

    const handlePlayClick = () => {
      if (videoRef) {
        if (!hasStarted) {
          videoRef.muted = false;
          videoRef.play();
          setIsPlaying(true);
          setHasStarted(true);
        } else {
          if (isPlaying) {
            videoRef.pause();
            setIsPlaying(false);
          } else {
            videoRef.play();
            setIsPlaying(true);
          }
        }
      }
    };

    const handleSpaceBar = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayClick();
      }
    };

    useEffect(() => {
      const fadeOutTimer = setTimeout(() => {
        setInstructionsClass('fade-out');
      }, 1700);

      const hideTimer = setTimeout(() => {
        setShowInstructions(false);
      }, 2000);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }, []);

    useEffect(() => {
      document.addEventListener('keydown', handleSpaceBar);
      return () => {
        document.removeEventListener('keydown', handleSpaceBar);
      };
    }, [isPlaying, hasStarted, videoRef]);

    return (
      <div className="video-container">
        <div className="video-content">
          <h1 className="video-title">Train your AI with pets!</h1>
          <div className="video-player">
            <video 
              ref={setVideoRef}
              className="game-video"
              playsInline
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}
              onEnded={handleVideoEnded}
            >
              <source src="/videos/l1q1.mp4" type="video/mp4" />
              <source src="/videos/l1q1.mov" type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
            
            {(!hasStarted || !isPlaying) && (
              <div className="play-button-overlay" onClick={handlePlayClick}>
                <div className="play-button">
                  {!hasStarted ? '▶️' : isPlaying ? '⏸️' : '▶️'}
                </div>
              </div>
            )}

            {showInstructions && (
              <div className={`video-overlay-animated ${instructionsClass}`}>
                <p className="video-instruction">
                  {!hasStarted 
                    ? '▶️ Click to start video' 
                    : isPlaying 
                      ? '⏸️ Click to pause' 
                      : '▶️ Click to play'
                  } • Press SPACE
                </p>
              </div>
            )}
          </div>
          <button className="skip-button" onClick={handleSkipVideo}>
            Skip Video
          </button>
        </div>
      </div>
    );
  };

  // Training completion logic with transition flag check
  useEffect(() => {
    if (completedPets === 4 && gamePhase === 'training' && !isTransitioning) {
      setGamePhase('loading');
      
      setTimeout(() => {
        setCurrentMessage({
          type: 'generation-prompt',
          text: "I want to show you something cool, ask me to create a picture of a dog or a cat!"
        });
        setGamePhase('generation');
        setIsTransitioning(false);
      }, 500);
    }
  }, [completedPets, gamePhase, isTransitioning]);

  // Check if generation phase is complete - now with flag check
  useEffect(() => {
    if (gamePhase === 'generation' && generatedPictures.includes('cat') && generatedPictures.includes('dog') && !isShowingFinalResult) {
      console.log('Game complete, but waiting for final result to finish showing...');
    }
  }, [generatedPictures, gamePhase, isShowingFinalResult]);

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
      setIsDragBlocked(true);
      
      setAvailablePets(prev => prev.filter(p => p.id !== draggedPet.id));
      
      // Play subtle thinking sound
      playThinkingSound();
      
      setCurrentMessage({
        type: 'thinking',
        text: 'AI is thinking...',
        pet: draggedPet
      });

      setTimeout(() => {
        const aiResponse = `That is a ${draggedPet.aiGuess}!`;
        setCurrentMessage({
          type: 'ai-response',
          text: aiResponse,
          pet: draggedPet
        });
      }, 1000);
    }
  };

  const handleFeedback = (userAnswer: 'yes' | 'no') => {
    const pet = currentMessage.pet;
    const aiWasCorrect = pet.type === pet.aiGuess;
    const userIsCorrect = (userAnswer === 'yes' && aiWasCorrect) || (userAnswer === 'no' && !aiWasCorrect);

    if (userIsCorrect) {
      // PLAY CORRECT SOUND
      playCorrectSound();
      
      const newCompletedCount = completedPets + 1;
      const isLastPet = newCompletedCount === 4;
      
      setCurrentMessage({
        type: 'correct',
        text: 'Correct!'
      });
      
      setCompletedPets(newCompletedCount);
      
      if (isLastPet) {
        setIsTransitioning(true);
      }
      
      setTimeout(() => {
        setCurrentMessage(null);
        setIsDragBlocked(false);
        if (isLastPet) {
          setIsTransitioning(false);
        }
      }, isLastPet ? 2500 : 1500);
    } else {
      // PLAY WRONG SOUND
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

  const handleSendMessage = () => {
    if (gamePhase !== 'generation') return;

    const message = inputText.toLowerCase().trim();
    
    if (message.includes('cat') || message.includes('dog')) {
      const requestedAnimal = message.includes('cat') ? 'cat' : 'dog';
      const generatedEmoji = requestedAnimal === 'cat' ? '🐱' : '🐶';
      
      // Update generated pictures first
      const updatedPictures = [...generatedPictures];
      if (!updatedPictures.includes(requestedAnimal)) {
        updatedPictures.push(requestedAnimal);
      }
      setGeneratedPictures(updatedPictures);
      
      // Check if this will complete the game
      const willCompleteGame = updatedPictures.includes('cat') && updatedPictures.includes('dog');
      
      setCurrentMessage({
        type: 'generated-image',
        text: `Here's a ${requestedAnimal} I created for you!`,
        image: generatedEmoji
      });
      
      // PLAY ANIMAL SOUND based on what was generated
      if (requestedAnimal === 'cat') {
        playCatMeow();
      } else if (requestedAnimal === 'dog') {
        playDogBark();
      }
      
      setInputText('');
      
      // Handle timing based on whether game is complete
      if (willCompleteGame) {
        // This is the final result - show it longer then end game
        setIsShowingFinalResult(true);
        setTimeout(() => {
          setIsShowingFinalResult(false);
          // PLAY SUCCESS SOUND when game completes
          playSuccessSound();
          
          // PLAY LILLY FINAL AUDIO after success sound finishes (approximate 3 second delay)
          setTimeout(() => {
            playLillyFinal();
          }, 3000);
          
          setGamePhase('loading');
          setTimeout(() => {
            setGamePhase('complete');
          }, 500);
        }, 3000);
      } else {
        // Not the final result - show normally then return to prompt
        setTimeout(() => {
          setCurrentMessage({
            type: 'generation-prompt',
            text: "I want to show you something cool, ask me to create a picture of a dog or a cat!"
          });
        }, 3000);
      }
    } else {
      setInputText('');
      
      setCurrentMessage({
        type: 'input-error',
        text: "Type either 'cat' or 'dog' into the text box!"
      });
      
      setTimeout(() => {
        setCurrentMessage({
          type: 'generation-prompt',
          text: "I want to show you something cool, ask me to create a picture of a dog or a cat!"
        });
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleReplay = () => {
    setAvailablePets(allPetPictures);
    setDraggedPet(null);
    setCurrentMessage(null);
    setGamePhase('video');
    setInputText('');
    setGeneratedPictures([]);
    setWrongAttempts({});
    setCompletedPets(0);
    setIsDragBlocked(false);
    setIsTransitioning(false);
    setIsShowingFinalResult(false);
  };

  // Show video intro
  if (gamePhase === 'video') {
    return <VideoIntro />;
  }

  // Show loading screen
  if (gamePhase === 'loading') {
    return <LoadingScreen />;
  }

  // Game completion screen
  if (gamePhase === 'complete') {
    return (
      <div className="game-container">
        <div className="game-content">
          <div className="completion-screen">
            <h1 className="completion-title">Congrats! You finished!</h1>
            <div className="completion-emoji">🎉</div>
            <p className="completion-message">
              You successfully trained the AI to recognize cats and dogs, and then used it to generate new pictures!
            </p>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button className="replay-button" onClick={handleReplay}>
                Replay
              </button>
              {onBackToMenu && (
                <button 
                  onClick={onBackToMenu}
                  style={{
                    padding: '15px 30px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
                >
                  Back to Games
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="game-container">
      <div className="game-content">
        {/* Header with back button */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
          {onBackToMenu && (
            <button 
              onClick={onBackToMenu} 
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
              onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
            >
              ← Back to Games
            </button>
          )}
          <h1 className="game-title" style={{margin: 0, flex: 1, textAlign: 'center'}}>
            Train your AI with pets!
          </h1>
          <div style={{width: '100px'}}></div> {/* Spacer for centering */}
        </div>
        
        <div className="chat-interface">
          <div 
            className="chat-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!currentMessage ? (
              <p className="chat-placeholder">
                {gamePhase === 'training' 
                  ? "Drag pictures here to train your AI!" 
                  : "I want to show you something cool, ask me to create a picture of a dog or a cat!"
                }
              </p>
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
            ) : currentMessage.type === 'input-error' ? (
              <div className="error-message">
                {currentMessage.text}
              </div>
            ) : currentMessage.type === 'generated-image' ? (
              <div className="chat-message">
                <div className="ai-avatar">🤖</div>
                <div className="message-content">
                  <div className="ai-response">{currentMessage.text}</div>
                  <div className="generated-image">{currentMessage.image}</div>
                </div>
              </div>
            ) : currentMessage.type === 'generation-prompt' ? (
              <div className="chat-message">
                <div className="ai-avatar">🤖</div>
                <div className="message-content">
                  <div className="ai-response">{currentMessage.text}</div>
                </div>
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
          
          <div className="input-area">
            <div className="input-row">
              <input 
                type="text" 
                placeholder={gamePhase === 'training' ? "Type a message..." : "Type 'cat' or 'dog'..."}
                className="chat-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={gamePhase === 'training'}
              />
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={gamePhase === 'training'}
              >
                Send
              </button>
            </div>
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
                  className={`pet-card ${isDragBlocked || currentMessage ? 'drag-disabled' : ''}`}
                  draggable={!isDragBlocked && !currentMessage}
                  onDragStart={() => handleDragStart(pet)}
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
  );
};

export default TrainAIGame;