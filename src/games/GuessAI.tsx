import React, { useState } from 'react';

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
const playLostSound = () => playAudio('/audio/you-lost.mp3', 0.6);

// Game data structure
interface GameItem {
  id: number;
  content: string;
  type: 'text' | 'image';
  isAI: boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Game scenarios - real-world AI situations
const gameData: GameItem[] = [
  {
    id: 1,
    content: "🔦 Your mom uses a regular flashlight to see in the dark",
    type: 'text',
    isAI: false,
    explanation: "A regular flashlight is just a simple light bulb and battery - no AI needed! It just turns on and off.",
    difficulty: 'easy'
  },
  {
    id: 2,
    content: "📱 YouTube recommends a funny cat video you end up loving",
    type: 'text',
    isAI: true,
    explanation: "YouTube uses AI to learn what you like and recommend videos just for you! It studies your viewing habits.",
    difficulty: 'easy'
  },
  {
    id: 3,
    content: "🚗 Your father turns on the car with his key",
    type: 'text',
    isAI: false,
    explanation: "Using a key to start a car is just a mechanical process - no AI involved, just metal and mechanics!",
    difficulty: 'easy'
  },
  {
    id: 4,
    content: "🗣️ You ask Siri to tell you a funny joke",
    type: 'text',
    isAI: true,
    explanation: "Siri uses AI to understand your voice and language, then thinks of a response! Voice assistants are AI helpers.",
    difficulty: 'easy'
  },
  {
    id: 5,
    content: "🤖 Your family's robot vacuum cleans around your toys without knocking them over",
    type: 'text',
    isAI: true,
    explanation: "Robot vacuums use AI to 'see' and navigate around objects! They learn the layout of your home and avoid obstacles.",
    difficulty: 'medium'
  }
];

const GuessAI: React.FC<{onBackToMenu?: () => void}> = ({ onBackToMenu }) => {
  // Game state
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<'video' | 'start' | 'loading' | 'playing' | 'feedback' | 'complete'>('video');
  const [userGuess, setUserGuess] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Get current item
  const currentItem = gameData[currentItemIndex];

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
      console.log('Video ended, transitioning to start screen...');
      setGamePhase('start');
    };

    const handleSkipVideo = () => {
      console.log('Video skipped, transitioning to start screen...');
      setGamePhase('start');
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

    React.useEffect(() => {
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

    React.useEffect(() => {
      document.addEventListener('keydown', handleSpaceBar);
      return () => {
        document.removeEventListener('keydown', handleSpaceBar);
      };
    }, [isPlaying, hasStarted, videoRef]);

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '800px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '2rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Learn to Spot AI!
          </h1>
          
          <div style={{
            position: 'relative',
            background: 'black',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <video 
              ref={setVideoRef}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                display: 'block'
              }}
              playsInline
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}
              onEnded={handleVideoEnded}
            >
              <source src="/videos/ai-or-not.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {(!hasStarted || !isPlaying) && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }} onClick={handlePlayClick}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}>
                  {!hasStarted ? '▶️' : isPlaying ? '⏸️' : '▶️'}
                </div>
              </div>
            )}

            {showInstructions && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                transition: 'opacity 0.3s ease-in-out',
                opacity: instructionsClass === 'fade-in' ? 1 : 0
              }}>
                <p style={{margin: 0}}>
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
          
          <button 
            onClick={handleSkipVideo}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#667eea';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Skip Video
          </button>
        </div>
      </div>
    );
  };

  const handleStartGame = () => {
    setGamePhase('loading');
    
    // Show loading screen for 2 seconds, then start the game
    setTimeout(() => {
      setGamePhase('playing');
    }, 2000);
  };

  const handleGuess = (guess: boolean) => {
    setUserGuess(guess);
    setGamePhase('feedback');
    setShowExplanation(true);
    
    // Check if guess is correct and play appropriate sound
    const isCorrect = guess === currentItem.isAI;
    
    if (isCorrect) {
      setScore(score + 1);
      playCorrectSound(); // Play correct sound
    } else {
      playWrongSound(); // Play wrong sound
    }
  };

  const handleNext = () => {
    if (currentItemIndex + 1 >= gameData.length) {
      setGamePhase('complete');
      
      // Play win/lose sound based on final score
      const finalPercentage = (score / gameData.length);
      setTimeout(() => {
        if (finalPercentage >= 0.7) {
          playSuccessSound(); // Play success sound for winning
        } else {
          playLostSound(); // Play lost sound for losing
        }
      }, 300); // Small delay to let the UI update first
      
    } else {
      setCurrentItemIndex(currentItemIndex + 1);
      setGamePhase('playing');
      setUserGuess(null);
      setShowExplanation(false);
    }
  };

  const resetGame = () => {
    setCurrentItemIndex(0);
    setScore(0);
    setGamePhase('video');
    setUserGuess(null);
    setShowExplanation(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #34d399, #3b82f6, #a855f7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        textAlign: 'center',
        maxWidth: '800px',
        width: '100%'
      }}>
        {/* Show video intro */}
        {gamePhase === 'video' ? (
          <VideoIntro />
        ) : (
          <>
            {/* Header with back button */}
            <div style={{position: 'relative', marginBottom: '2rem'}}>
              {onBackToMenu && gamePhase === 'start' && (
                <button 
                  onClick={onBackToMenu}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    padding: '8px 16px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  ← Back to Games
                </button>
              )}
              <h1 style={{margin: 0, textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#333'}}>
                Guess AI
              </h1>
            </div>

        {/* Score display */}
        <div style={{marginBottom: '1.5rem'}}>
          <p style={{fontSize: '1.1rem', color: '#666'}}>
            Score: {score}/{gameData.length} | Question {currentItemIndex + 1}/{gameData.length}
          </p>
        </div>

        {/* Game content */}
        {gamePhase === 'start' ? (
          <div>
            <div style={{
              padding: '2rem 1.5rem',
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              borderRadius: '16px',
              marginBottom: '2rem',
              border: '2px solid #0ea5e9'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🤔</div>
              <h2 style={{fontSize: '1.5rem', color: '#0c4a6e', marginBottom: '1rem', fontWeight: 'bold'}}>
                Ready to Spot AI?
              </h2>
              <p style={{fontSize: '1rem', color: '#0369a1', lineHeight: '1.5', marginBottom: '1.5rem'}}>
                Test your skills! I'll show you 5 everyday situations and you guess whether AI is being used or not.
              </p>
              <div style={{
                background: 'rgba(14, 165, 233, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <p style={{color: '#0369a1', fontSize: '0.95rem', margin: 0}}>
                  💡 <strong>Tip:</strong> Think about whether the technology needs to "learn" or "make decisions" on its own!
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleStartGame}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                boxShadow: '0 8px 16px rgba(14, 165, 233, 0.3)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(14, 165, 233, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(14, 165, 233, 0.3)';
              }}
            >
              🚀 Start Game
            </button>
          </div>
        ) : gamePhase === 'loading' ? (
          <div style={{padding: '3rem 2rem'}}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '5px solid #e0f2fe',
              borderTop: '5px solid #0ea5e9',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 2rem'
            }}></div>
            <h2 style={{fontSize: '1.3rem', color: '#0c4a6e', marginBottom: '1rem'}}>
              Loading Game...
            </h2>
            <p style={{color: '#0369a1', fontSize: '0.95rem'}}>
              Preparing your AI detection challenge!
            </p>
            
            {/* Loading animation styles */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `
            }} />
          </div>
        ) : gamePhase === 'complete' ? (
          <div style={{
            animation: 'fadeIn 0.8s ease-in-out',
            padding: '1rem'
          }}>
            {/* Score Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '2px solid #cbd5e1',
              textAlign: 'center'
            }}>
              <h2 style={{fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b'}}>
                🎯 Final Score
              </h2>
              
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#3b82f6'
              }}>
                {score}/{gameData.length}
              </div>
              
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#64748b'
              }}>
                {Math.round((score / gameData.length) * 100)}% Correct
              </div>
              
              {/* Pass/Fail Message */}
              {(score / gameData.length) >= 0.7 ? (
                <div style={{
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  border: '2px solid #10b981',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🎉</div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#065f46',
                    marginBottom: '0.3rem'
                  }}>
                    You Win!
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#047857',
                    margin: 0
                  }}>
                    Great job spotting AI! 🕵️
                  </p>
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  border: '2px solid #ef4444',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>😅</div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '0.3rem'
                  }}>
                    You Lost!
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#b91c1c',
                    marginBottom: '0.5rem'
                  }}>
                    You need 70% or higher to pass. Try again!
                  </p>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#7f1d1d',
                    margin: 0
                  }}>
                    💡 Think: Does it "learn" or "make decisions"?
                  </p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={resetGame}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                🔄 Play Again
              </button>
              
              {/* Only show "Back to Games" if they passed */}
              {(score / gameData.length) >= 0.7 && onBackToMenu && (
                <button 
                  onClick={onBackToMenu}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #10b981, #047857)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  🏠 Back to Games
                </button>
              )}
            </div>
            
            {/* Fade-in animation */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes fadeIn {
                  0% {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `
            }} />
          </div>
        ) : (
          <div>
            {/* Current item display */}
            <div style={{
              padding: '2rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              marginBottom: '2rem',
              minHeight: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{fontSize: '1.2rem', color: '#333', lineHeight: '1.6'}}>
                {currentItem?.content}
              </p>
            </div>

            {/* Question */}
            <h3 style={{fontSize: '1.3rem', color: '#333', marginBottom: '1.5rem'}}>
              Does this situation use AI?
            </h3>

            {/* Answer buttons */}
            {gamePhase === 'playing' && (
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem'}}>
                <button 
                  onClick={() => handleGuess(true)}
                  style={{
                    padding: '12px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  ✅ Yes, AI is used
                </button>
                <button 
                  onClick={() => handleGuess(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  ❌ No, no AI here
                </button>
              </div>
            )}

            {/* Feedback section */}
            {gamePhase === 'feedback' && (
              <div style={{marginBottom: '2rem'}}>
                <div style={{
                  padding: '1rem',
                  background: userGuess === currentItem.isAI ? '#d1fae5' : '#fee2e2',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <p style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: userGuess === currentItem.isAI ? '#065f46' : '#dc2626'
                  }}>
                    {userGuess === currentItem.isAI ? '✅ Correct!' : '❌ Incorrect'}
                  </p>
                  <p style={{color: '#333', marginTop: '0.5rem'}}>
                    {currentItem.isAI ? 'Yes, this uses AI!' : 'No, this does not use AI.'}
                  </p>
                </div>

                {showExplanation && (
                  <div style={{
                    padding: '1rem',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <p style={{color: '#374151', fontSize: '0.95rem'}}>
                      💡 {currentItem.explanation}
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleNext}
                  style={{
                    padding: '12px 24px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {currentItemIndex + 1 >= gameData.length ? 'Finish Game' : 'Next Question'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GuessAI;