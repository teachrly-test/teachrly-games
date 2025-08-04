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

// Specific audio functions
const playCorrectSound = () => playAudio('/audio/correct-ding.mp3', 0.7);
const playWrongSound = () => playAudio('/audio/wrong-buzz.mp3', 0.5);
const playThinkingSound = () => playAudio('/audio/thinking-beep.mp3', 0.3);
const playLillyStart = () => playAudio('/audio/lilly-start.mp3', 0.7);
const playSuccessSound = () => playAudio('/audio/success.mp3', 0.8);
const playCatMeow = () => playAudio('/audio/cat-meow.mp3', 0.6);
const playDogBark = () => playAudio('/audio/dog-bark.mp3', 0.6);
const playLillyFinal = () => playAudio('/audio/lilly-final.mp3', 0.7);

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
  const [gamePhase, setGamePhase] = useState<'video' | 'loading' | 'training' | 'generation' | 'complete'>('video');
  const [inputText, setInputText] = useState('');
  const [generatedPictures, setGeneratedPictures] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState<{[key: number]: number}>({});
  const [completedPets, setCompletedPets] = useState(0);
  const [isDragBlocked, setIsDragBlocked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isShowingFinalResult, setIsShowingFinalResult] = useState(false);
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

  // Touch handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, pet: any) => {
    if (currentMessage || isDragBlocked) {
      return;
    }
    
    console.log('Touch start for:', pet.name);
    setTouchDragPet(pet);
    setIsDragging(true);
    
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    
    // Use CSS and body styles to prevent scrolling
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragPet || !isDragging) return;
    
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
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

  // Training completion logic - transitions to generation phase
  useEffect(() => {
    if (completedPets === 4 && gamePhase === 'training' && !isTransitioning) {
      setIsTransitioning(true);
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

  // Check if generation phase is complete
  useEffect(() => {
    if (gamePhase === 'generation' && generatedPictures.includes('cat') && generatedPictures.includes('dog') && !isShowingFinalResult) {
      console.log('Game complete, but waiting for final result to finish showing...');
    }
  }, [generatedPictures, gamePhase, isShowingFinalResult]);

  // Loading component
  const LoadingScreen = () => {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ fontSize: '1.2rem', color: '#333', margin: '0' }}>Loading...</p>
        </div>
      </div>
    );
  };

  // Video intro component
  const VideoIntro = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

    const handleVideoEnded = () => {
      console.log('Video ended, transitioning to game...');
      setGamePhase('loading');
      setTimeout(() => {
        setGamePhase('training');
        playLillyStart();
      }, 500);
    };

    const handleSkipVideo = () => {
      console.log('Video skipped, transitioning to game...');
      setGamePhase('loading');
      setTimeout(() => {
        setGamePhase('training');
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

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)', maxWidth: '800px', width: '100%' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', marginBottom: '2rem' }}>Train your AI with pets!</h1>
          <div style={{ position: 'relative', marginBottom: '2rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video 
              ref={setVideoRef}
              style={{ width: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', maxWidth: '100%' }}
              playsInline
              onEnded={handleVideoEnded}
            >
              <source src="/videos/l1q1.mp4" type="video/mp4" />
              <source src="/videos/l1q1.mov" type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
            
            {(!hasStarted || !isPlaying) && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10 }} onClick={handlePlayClick}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(0, 0, 0, 0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', transition: 'all 0.3s ease' }}>
                  {!hasStarted ? '▶️' : isPlaying ? '⏸️' : '▶️'}
                </div>
              </div>
            )}
          </div>
          <button style={{ padding: '12px 24px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={handleSkipVideo}>
            Skip Video
          </button>
        </div>
      </div>
    );
  };

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)', maxWidth: '600px', width: '100%' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>Congrats! You finished!</h1>
          <div style={{ fontSize: '4rem', margin: '1rem 0' }}>🎉</div>
          <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.6', marginBottom: '2rem' }}>
            You successfully trained the AI to recognize cats and dogs, and then used it to generate new pictures!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{ padding: '15px 30px', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }} onClick={handleReplay}>
              Replay
            </button>
            {onBackToMenu && (
              <button style={{ padding: '15px 30px', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', background: '#6b7280', color: 'white' }} onClick={onBackToMenu}>
                Back to Games
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes thinking {
            0%, 60%, 100% { transform: scale(1); opacity: 0.7; }
            30% { transform: scale(1.2); opacity: 1; }
          }
        `}
      </style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        
        {/* Mobile drag preview */}
        {isDragging && touchDragPet && dragPosition.x > 0 && dragPosition.y > 0 && (
          <div 
            style={{
              position: 'fixed',
              pointerEvents: 'none',
              zIndex: 1000,
              transform: `translate(${dragPosition.x - 50}px, ${dragPosition.y - 50}px)`,
              opacity: 0.8,
              background: 'white',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid #667eea',
              fontSize: '0.8rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              textAlign: 'center',
              top: 0,
              left: 0,
              willChange: 'transform'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'block' }}>{touchDragPet.emoji}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500', whiteSpace: 'nowrap' }}>{touchDragPet.name}</div>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)', padding: '2rem', width: '100%', maxWidth: '900px' }}>
          {/* Header with back button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {onBackToMenu && (
              <button 
                onClick={onBackToMenu} 
                style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }}
              >
                ← Back
              </button>
            )}
            <h1 style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
              Train your AI with pets!
            </h1>
            <div style={{ width: '100px' }}></div>
          </div>
          
          <div style={{ background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div 
              style={{ minHeight: '200px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px dashed #e2e8f0', borderRadius: '16px 16px 0 0', background: isDragging ? '#f0f9ff' : 'white', borderColor: isDragging ? '#667eea' : '#e2e8f0', borderStyle: 'solid' }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="chat-area"
            >
              {!currentMessage ? (
                <p style={{ color: isDragging ? '#667eea' : '#64748b', fontSize: '1.1rem', textAlign: 'center', margin: 0, fontWeight: isDragging ? '600' : 'normal' }}>
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>🤖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', fontSize: '1rem', marginBottom: '1rem' }}>Let me take a look at this...</div>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '4rem' }}>{currentMessage.pet?.emoji}</div>
                      <div style={{fontSize: '1rem', color: '#64748b', marginTop: '0.5rem'}}>
                        {currentMessage.pet?.name}
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentMessage.type === 'thinking' ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>🤖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', fontSize: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea', animation: 'thinking 1.4s infinite' }}></span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea', animation: 'thinking 1.4s infinite', animationDelay: '0.2s' }}></span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea', animation: 'thinking 1.4s infinite', animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '4rem' }}>{currentMessage.pet?.emoji}</div>
                    </div>
                  </div>
                </div>
              ) : currentMessage.type === 'correct' ? (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '12px', fontSize: '1.2rem', fontWeight: '600', textAlign: 'center', border: '2px solid #10b981' }}>
                  {currentMessage.text}
                </div>
              ) : currentMessage.type === 'retry' ? (
                <div style={{ background: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', textAlign: 'center', border: '2px solid #f59e0b' }}>
                  {currentMessage.text}
                </div>
              ) : currentMessage.type === 'input-error' ? (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', textAlign: 'center', border: '2px solid #ef4444' }}>
                  {currentMessage.text}
                </div>
              ) : currentMessage.type === 'generated-image' ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>🤖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ textAlign: 'center', fontSize: '4rem', marginTop: '1rem' }}>{currentMessage.image}</div>
                  </div>
                </div>
              ) : currentMessage.type === 'generation-prompt' ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>🤖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', fontSize: '1rem', marginBottom: '1rem' }}>{currentMessage.text}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>🤖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', fontSize: '1rem', marginBottom: '1rem' }}>{currentMessage.text}</div>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '4rem' }}>{currentMessage.pet?.emoji}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333', fontWeight: '600' }}>Did the AI get it right?</p>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', minWidth: '50px', background: '#10b981', color: 'white' }}
                          onClick={() => handleFeedback('yes')}
                        >
                          Yes
                        </button>
                        <button 
                          style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', minWidth: '50px', background: '#ef4444', color: 'white' }}
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
            
            <div style={{ background: '#f1f5f9', padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder={gamePhase === 'training' ? "Type a message..." : "Type 'cat' or 'dog'..."}
                  style={{ flex: 1, padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', background: gamePhase === 'training' ? '#f8fafc' : 'white', color: gamePhase === 'training' ? '#94a3b8' : 'black', cursor: gamePhase === 'training' ? 'not-allowed' : 'text' }}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={gamePhase === 'training'}
                />
                <button 
                  style={{ padding: '12px 24px', background: gamePhase === 'training' ? '#94a3b8' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: gamePhase === 'training' ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', transform: 'none' }}
                  onClick={handleSendMessage}
                  disabled={gamePhase === 'training'}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          {gamePhase === 'training' && (
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '1rem', textAlign: 'center' }}>
                Your Pet Pictures:
                {availablePets.length > 0 && ` (${availablePets.length} remaining)`}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {availablePets.map((pet) => (
                  <div 
                    key={pet.id} 
                    ref={el => { petCardRefs.current[pet.id] = el; }}
                    style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      textAlign: 'center', 
                      cursor: (isDragBlocked || currentMessage) ? 'not-allowed' : 'grab', 
                      transition: 'all 0.2s ease', 
                      border: '2px solid #e2e8f0', 
                      userSelect: 'none', 
                      touchAction: 'none',
                      opacity: (touchDragPet?.id === pet.id && isDragging) ? 0.3 : (isDragBlocked || currentMessage) ? 0.5 : 1,
                      transform: (touchDragPet?.id === pet.id && isDragging) ? 'scale(0.9)' : 'none'
                    }}
                    draggable={!isMobile && !isDragBlocked && !currentMessage}
                    onDragStart={() => !isMobile && handleDragStart(pet)}
                    onTouchStart={(e) => isMobile && handleTouchStart(e, pet)}
                    onTouchMove={(e) => isMobile && handleTouchMove(e)}
                    onTouchEnd={(e) => isMobile && handleTouchEnd(e)}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{pet.emoji}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>{pet.name}</div>
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