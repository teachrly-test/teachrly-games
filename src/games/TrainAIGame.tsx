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
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Loading component
  const LoadingScreen = () => {
    return (
      <>
        <style>
          {`
            .loading-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .loading-content {
              text-align: center;
              background: white;
              padding: 2rem;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #667eea;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem auto;
            }
            .loading-text {
              font-size: 1.2rem;
              color: #333;
              margin: 0;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            /* Mobile responsive styles */
            @media (max-width: 768px) {
              .loading-container {
                padding: 16px;
              }
              .loading-content {
                padding: 1.5rem;
                max-width: 90%;
                width: 100%;
              }
              .loading-text {
                font-size: 1rem;
              }
            }
          `}
        </style>
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading...</p>
          </div>
        </div>
      </>
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
      <>
        <style>
          {`
            .video-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .video-content {
              text-align: center;
              background: white;
              padding: 2rem;
              border-radius: 24px;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
              max-width: 800px;
              width: 100%;
            }
            .video-title {
              font-size: 2rem;
              font-weight: bold;
              color: #333;
              margin-bottom: 2rem;
            }
            .video-player {
              position: relative;
              margin-bottom: 2rem;
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .game-video {
              width: 100%;
              height: auto;
              border-radius: 12px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
              max-width: 100%;
            }
            .play-button-overlay {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              cursor: pointer;
              z-index: 10;
            }
            .play-button {
              width: 80px;
              height: 80px;
              background: rgba(0, 0, 0, 0.7);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2rem;
              transition: all 0.3s ease;
            }
            .play-button:hover {
              background: rgba(0, 0, 0, 0.8);
              transform: scale(1.1);
            }
            .video-overlay-animated {
              position: absolute;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 12px 20px;
              border-radius: 20px;
              font-size: 0.9rem;
              transition: opacity 0.3s ease;
            }
            .fade-in {
              opacity: 1;
            }
            .fade-out {
              opacity: 0;
            }
            .video-instruction {
              margin: 0;
              font-weight: 500;
            }
            .skip-button {
              padding: 12px 24px;
              background: #6b7280;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .skip-button:hover {
              background: #4b5563;
              transform: translateY(-1px);
            }
            
            /* Mobile responsive styles */
            @media (max-width: 768px) {
              .video-container {
                padding: 16px;
              }
              .video-content {
                padding: 1.5rem;
                max-width: 100%;
              }
              .video-title {
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
              }
              .video-player {
                /* Force landscape video display on mobile */
                width: 100vw;
                max-width: calc(100vw - 32px);
                margin-left: calc(-1.5rem);
                margin-right: calc(-1.5rem);
                padding: 0 16px;
                box-sizing: border-box;
              }
              .game-video {
                width: 100%;
                height: auto;
                /* Maintain aspect ratio but use full width */
                aspect-ratio: 16/9;
                object-fit: contain;
              }
              .play-button {
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
              }
              .video-overlay-animated {
                bottom: 10px;
                padding: 8px 16px;
                font-size: 0.8rem;
              }
              .skip-button {
                padding: 10px 20px;
                font-size: 0.9rem;
              }
            }
            
            @media (max-width: 480px) {
              .video-content {
                padding: 1rem;
              }
              .video-title {
                font-size: 1.25rem;
              }
              .video-player {
                /* Even more aggressive landscape formatting for small phones */
                width: 100vw;
                max-width: calc(100vw - 32px);
                margin-left: calc(-1rem);
                margin-right: calc(-1rem);
                padding: 0 16px;
              }
              .game-video {
                width: 100%;
                /* Force 16:9 aspect ratio */
                aspect-ratio: 16/9;
                object-fit: cover;
                border-radius: 8px;
              }
              .play-button {
                width: 50px;
                height: 50px;
                font-size: 1.25rem;
              }
              .video-overlay-animated {
                font-size: 0.7rem;
                padding: 6px 12px;
              }
            }
            
            /* Portrait orientation specific styles */
            @media (max-width: 768px) and (orientation: portrait) {
              .video-player {
                /* Break out of container for full-width landscape video */
                position: relative;
                left: 50%;
                right: 50%;
                margin-left: -50vw;
                margin-right: -50vw;
                width: 100vw;
                max-width: 100vw;
                padding: 0 20px;
                box-sizing: border-box;
              }
              .game-video {
                width: 100%;
                height: auto;
                /* Enforce landscape aspect ratio */
                aspect-ratio: 16/9;
                object-fit: contain;
                background: #000;
              }
            }
          `}
        </style>
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
      </>
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
      <>
        <style>
          {`
            .completion-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .completion-content {
              text-align: center;
              background: white;
              padding: 3rem;
              border-radius: 24px;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
              max-width: 600px;
              width: 100%;
            }
            .completion-title {
              font-size: 2.5rem;
              font-weight: bold;
              color: #333;
              margin-bottom: 1rem;
            }
            .completion-emoji {
              font-size: 4rem;
              margin: 1rem 0;
            }
            .completion-message {
              font-size: 1.2rem;
              color: #555;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .completion-buttons {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            .replay-button, .back-button {
              padding: 15px 30px;
              border: none;
              border-radius: 8px;
              font-size: 1.1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .replay-button {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
            }
            .replay-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            }
            .back-button {
              background: #6b7280;
              color: white;
            }
            .back-button:hover {
              background: #4b5563;
              transform: translateY(-1px);
            }
            
            /* Mobile responsive styles */
            @media (max-width: 768px) {
              .completion-container {
                padding: 16px;
              }
              .completion-content {
                padding: 2rem 1.5rem;
                max-width: 100%;
              }
              .completion-title {
                font-size: 1.8rem;
              }
              .completion-emoji {
                font-size: 3rem;
              }
              .completion-message {
                font-size: 1rem;
              }
              .completion-buttons {
                flex-direction: column;
                align-items: center;
              }
              .replay-button, .back-button {
                padding: 12px 24px;
                font-size: 1rem;
                width: 100%;
                max-width: 200px;
              }
            }
            
            @media (max-width: 480px) {
              .completion-content {
                padding: 1.5rem 1rem;
              }
              .completion-title {
                font-size: 1.5rem;
              }
              .completion-emoji {
                font-size: 2.5rem;
              }
              .completion-message {
                font-size: 0.9rem;
              }
            }
          `}
        </style>
        <div className="completion-container">
          <div className="completion-content">
            <h1 className="completion-title">Congrats! You finished!</h1>
            <div className="completion-emoji">🎉</div>
            <p className="completion-message">
              You successfully trained the AI to recognize cats and dogs, and then used it to generate new pictures!
            </p>
            <div className="completion-buttons">
              <button className="replay-button" onClick={handleReplay}>
                Replay
              </button>
              {onBackToMenu && (
                <button className="back-button" onClick={onBackToMenu}>
                  Back to Games
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

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
          .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 1rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
            border: 2px solid #ef4444;
          }
          .generated-image {
            text-align: center;
            font-size: 4rem;
            margin-top: 1rem;
          }
          .input-area {
            background: #f1f5f9;
            padding: 1rem;
          }
          .input-row {
            display: flex;
            gap: 0.5rem;
          }
          .chat-input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
          }
          .chat-input:focus {
            border-color: #667eea;
          }
          .chat-input:disabled {
            background: #f8fafc;
            color: #94a3b8;
            cursor: not-allowed;
          }
          .send-button {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .send-button:hover:not(:disabled) {
            background: #5a67d8;
            transform: translateY(-1px);
          }
          .send-button:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            transform: none;
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
            .correct-message, .retry-message, .error-message {
              font-size: 1rem;
              padding: 0.75rem;
            }
            .generated-image {
              font-size: 3rem;
            }
            .input-area {
              padding: 0.75rem;
            }
            .input-row {
              flex-direction: column;
              gap: 0.5rem;
            }
            .chat-input {
              font-size: 0.9rem;
              padding: 10px 12px;
            }
            .send-button {
              font-size: 0.9rem;
              padding: 10px 20px;
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
            .generated-image {
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
              className="chat-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!currentMessage ? (
                <p className="chat-placeholder">
                  {gamePhase === 'training' 
                    ? isMobile ? "Tap and drag pictures here to train your AI!" : "Drag pictures here to train your AI!"
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
    </>
  );
};

export default TrainAIGame;