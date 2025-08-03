import React, { useState, useEffect, useRef } from 'react';

// Audio helper function
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
const playWrongSound = () => playAudio('/audio/wrong-buzz.mp3', 0.5);
const playCorrectSound = () => playAudio('/audio/correct2.mp3', 0.5);

// Data item structure
interface DataItem {
  id: number;
  content: string;
  emoji: string;
  category: 'picture' | 'word' | 'sound' | 'number';
  description: string;
}

// Game data items to sort
const dataItems: DataItem[] = [
  // Picture Data
  { id: 1, content: "Family vacation photo", emoji: "📷", category: "picture", description: "A photo showing visual information" },
  { id: 2, content: "Camera shot of House", emoji: "🏠", category: "picture", description: "A photograph with visual data" },
  { id: 3, content: "Painting of a sunset", emoji: "🎨", category: "picture", description: "Artistic visual content" },
  { id: 4, content: "Picture of Bar Graph", emoji: "📊", category: "picture", description: "Visual representation of data" },
  
  // Word Data
  { id: 5, content: "Story from a book", emoji: "📖", category: "word", description: "Text and language content" },
  { id: 6, content: "Text message conversation", emoji: "💬", category: "word", description: "Written communication data" },
  { id: 7, content: "Newspaper headline", emoji: "📰", category: "word", description: "News text information" },
  { id: 8, content: "Shopping list", emoji: "📝", category: "word", description: "Written list of items" },
  
  // Sound Data
  { id: 9, content: "Favorite song", emoji: "🎵", category: "sound", description: "Musical audio content" },
  { id: 10, content: "Voice recording", emoji: "🗣️", category: "sound", description: "Spoken audio information" },
  { id: 11, content: "Dog barking sound", emoji: "🐕", category: "sound", description: "Animal audio data" },
  { id: 12, content: "Rain falling audio", emoji: "🌧️", category: "sound", description: "Environmental sound data" },
  
  // Number Data
  { id: 13, content: "Temperature readings", emoji: "🌡️", category: "number", description: "Numerical measurement data" },
  { id: 14, content: "Test scores", emoji: "📈", category: "number", description: "Performance number data" },
  { id: 15, content: "Price list", emoji: "💰", category: "number", description: "Cost information in numbers" },
  { id: 16, content: "Time schedule", emoji: "⏰", category: "number", description: "Time-based numerical data" }
];

const DataAI: React.FC<{onBackToMenu?: () => void}> = ({ onBackToMenu }) => {
  // Game state
  const [gamePhase, setGamePhase] = useState<'instructions' | 'sorting' | 'loading' | 'requesting'>('instructions');
  const [availableItems, setAvailableItems] = useState<DataItem[]>([]);
  const [sortedItems, setSortedItems] = useState<{[key: string]: DataItem[]}>({
    picture: [],
    word: [],
    sound: [],
    number: []
  });
  const [draggedItem, setDraggedItem] = useState<DataItem | null>(null);
  const [requestedTypes, setRequestedTypes] = useState<string[]>([]);
  const [aiGenerations, setAiGenerations] = useState<{[key: string]: string}>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [incorrectItems, setIncorrectItems] = useState<number[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<string[]>([]);
  
  // Mobile touch support
  const [touchDragItem, setTouchDragItem] = useState<DataItem | null>(null);
  const [dragPreview, setDragPreview] = useState<{x: number, y: number, show: boolean}>({ x: 0, y: 0, show: false });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Audio refs
  const instructionsAudioRef = useRef<HTMLAudioElement | null>(null);
  const completionAudioRef = useRef<HTMLAudioElement | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Play instructions audio when component mounts and on instructions phase
  useEffect(() => {
    if (gamePhase === 'instructions') {
      try {
        instructionsAudioRef.current = new Audio('/audio/help-trainai.mp3');
        instructionsAudioRef.current.volume = 0.5;
        instructionsAudioRef.current.play().catch(error => {
          console.log('Instructions audio play failed:', error);
        });
      } catch (error) {
        console.log('Instructions audio creation failed:', error);
      }
    }

    // Cleanup function to stop audio when leaving instructions
    return () => {
      if (instructionsAudioRef.current) {
        instructionsAudioRef.current.pause();
        instructionsAudioRef.current = null;
      }
    };
  }, [gamePhase]);

  // Check for game completion
  useEffect(() => {
    if (gamePhase === 'sorting') {
      const totalItemsInCategories = Object.values(sortedItems).flat().length;
      const hasIncorrectItems = incorrectItems.length > 0;
      const noAvailableItems = availableItems.length === 0;
      
      if (totalItemsInCategories === 12 && !hasIncorrectItems && noAvailableItems) {
        console.log('Game completion detected:', { totalItemsInCategories, hasIncorrectItems, noAvailableItems });
        setTimeout(() => setGamePhase('loading'), 500);
      }
    }
  }, [sortedItems, incorrectItems, availableItems, gamePhase]);

  // Handle loading phase transition to AI generation
  useEffect(() => {
    if (gamePhase === 'loading') {
      console.log('Loading phase reached, attempting to play aidata-gen.mp3');
      // Play audio immediately when loading starts
      try {
        const aiAudio = new Audio('/audio/aidata-gen.mp3');
        aiAudio.volume = 0.5;
        console.log('Audio object created, attempting to play...');
        aiAudio.play().then(() => {
          console.log('Audio played successfully');
        }).catch(error => {
          console.log('Audio play failed:', error);
        });
      } catch (error) {
        console.log('Audio creation failed:', error);
      }

      // Transition to requesting phase after loading
      setTimeout(() => {
        setGamePhase('requesting');
      }, 2000);
    }
  }, [gamePhase]);

  // Function to get 3 random items from each category
  const getRandomizedItems = () => {
    const categories = ['picture', 'word', 'sound', 'number'];
    const selectedItems: DataItem[] = [];

    categories.forEach(category => {
      const categoryItems = dataItems.filter(item => item.category === category);
      const shuffled = [...categoryItems].sort(() => Math.random() - 0.5);
      selectedItems.push(...shuffled.slice(0, 3));
    });

    return selectedItems.sort(() => Math.random() - 0.5);
  };

  // Category information
  const categories = {
    picture: { name: "Picture Data", color: "#3b82f6", emoji: "🖼️" },
    word: { name: "Word Data", color: "#10b981", emoji: "📝" },
    sound: { name: "Sound Data", color: "#f59e0b", emoji: "🔊" },
    number: { name: "Number Data", color: "#ef4444", emoji: "🔢" }
  };

  // AI generation symbols for each category
  const aiSymbols = {
    picture: ['🖼️', '📸', '🎨', '🌅', '🏔️', '🌈', '🎭', '🖌️'],
    word: ['📜', '✍️', '📚', '💭', '🗨️', '📝', '✨', '🎪'],
    sound: ['🎼', '🎶', '🔊', '🎤', '🎸', '🥁', '🎺', '🎧'],
    number: ['📊', '📈', '🔢', '💯', '⚡', '🎯', '📐', '🧮']
  };

  const startSorting = () => {
    // Stop instructions audio when starting game
    if (instructionsAudioRef.current) {
      instructionsAudioRef.current.pause();
      instructionsAudioRef.current = null;
    }
    
    setAvailableItems(getRandomizedItems());
    setGamePhase('sorting');
  };

  // Touch handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, item: DataItem) => {
    e.preventDefault();
    e.stopPropagation();
    setTouchDragItem(item);
    const touch = e.touches[0];
    setDragPreview({
      x: touch.clientX,
      y: touch.clientY,
      show: true
    });
    
    // Prevent page scrolling during drag
    document.body.style.overflow = 'hidden';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragItem) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    setDragPreview({
      x: touch.clientX,
      y: touch.clientY,
      show: true
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchDragItem) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the drop zone by looking for data-drop-zone attribute
    const dropZone = elementBelow?.closest('[data-drop-zone]');
    if (dropZone) {
      const category = dropZone.getAttribute('data-drop-zone');
      if (category) {
        // Use the same drop logic as desktop
        processDrop(touchDragItem, category);
      }
    }
    
    setTouchDragItem(null);
    setDragPreview({ x: 0, y: 0, show: false });
    
    // Re-enable page scrolling
    document.body.style.overflow = 'auto';
  };

  // Desktop drag handlers
  const handleDragStart = (item: DataItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    if (draggedItem) {
      processDrop(draggedItem, targetCategory);
      setDraggedItem(null);
    }
  };

  // Unified drop processing for both desktop and mobile
  const processDrop = (item: DataItem, targetCategory: string) => {
    const isCorrect = item.category === targetCategory;
    
    // Remove item from wherever it currently is
    setAvailableItems(prev => prev.filter(i => i.id !== item.id));
    setSortedItems(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(category => {
        updated[category as keyof typeof updated] = updated[category as keyof typeof updated].filter(i => i.id !== item.id);
      });
      return updated;
    });
    
    if (isCorrect) {
      // Correct placement - play success sound
      playCorrectSound();
      
      setErrorMessage('');
      setIncorrectItems(prev => prev.filter(id => id !== item.id));
      
      setSortedItems(prev => ({
        ...prev,
        [targetCategory]: [...prev[targetCategory as keyof typeof prev], item]
      }));
    } else {
      // Wrong placement - play wrong sound
      playWrongSound();
      
      const categoryNames = {
        picture: 'Picture Data',
        word: 'Word Data', 
        sound: 'Sound Data',
        number: 'Number Data'
      };
      
      const correctCategoryName = categoryNames[item.category as keyof typeof categoryNames];
      const wrongCategoryName = categoryNames[targetCategory as keyof typeof categoryNames];
      setErrorMessage(`❌ "${item.content}" belongs in ${correctCategoryName}, not ${wrongCategoryName}!`);
      
      setIncorrectItems(prev => [...prev.filter(id => id !== item.id), item.id]);
      setSortedItems(prev => ({
        ...prev,
        [targetCategory]: [...prev[targetCategory as keyof typeof prev], item]
      }));
      
      setTimeout(() => {
        setErrorMessage('');
      }, 4000);
    }
  };

  const handleAIRequest = (dataType: string) => {
    if (requestedTypes.includes(dataType) || loadingTypes.includes(dataType)) return;

    console.log('🔥 Starting generation for:', dataType);

    // Start loading for this data type
    setLoadingTypes(prev => {
      console.log('📤 Adding to loading:', [...prev, dataType]);
      return [...prev, dataType];
    });

    // Play thinking sound
    try {
      const thinkingAudio = new Audio('/audio/thinking-beep.mp3');
      thinkingAudio.volume = 0.5;
      thinkingAudio.play().catch(error => {
        console.log('Thinking audio play failed:', error);
      });
    } catch (error) {
      console.log('Thinking audio creation failed:', error);
    }

    // Simulate AI generation delay
    setTimeout(() => {
      console.log('⚡ Completing generation for:', dataType);
      
      // Generate the symbol first
      const symbols = aiSymbols[dataType as keyof typeof aiSymbols];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      console.log('🎯 Generated symbol:', randomSymbol);
      
      // Use functional updates to ensure state consistency
      setLoadingTypes(prev => {
        const newState = prev.filter(type => type !== dataType);
        console.log('⏳ Updated loadingTypes:', newState);
        return newState;
      });
      
      setRequestedTypes(prev => {
        const newState = [...prev, dataType];
        console.log('✅ Updated requestedTypes:', newState);
        return newState;
      });
      
      setAiGenerations(prev => {
        const newState = { ...prev, [dataType]: randomSymbol };
        console.log('🎨 Updated aiGenerations:', newState);
        return newState;
      });

      // Check completion after a brief delay to ensure state has settled
      setTimeout(() => {
        if (requestedTypes.length + 1 >= 4) {
          console.log('🎉 All 4 types completed!');
          try {
            completionAudioRef.current = new Audio('/audio/aidata-complete.mp3');
            completionAudioRef.current.volume = 0.5;
            completionAudioRef.current.play().catch(error => {
              console.log('Completion audio play failed:', error);
            });
          } catch (error) {
            console.log('Completion audio creation failed:', error);
          }
        }
      }, 100);
    }, 2000);
  };

  const resetGame = () => {
    // Stop completion audio if playing
    if (completionAudioRef.current) {
      completionAudioRef.current.pause();
      completionAudioRef.current = null;
    }

    setGamePhase('instructions');
    setAvailableItems([]);
    setSortedItems({ picture: [], word: [], sound: [], number: [] });
    setRequestedTypes([]);
    setAiGenerations({});
    setErrorMessage('');
    setIncorrectItems([]);
    setLoadingTypes([]);
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
          }
          
          /* Mobile responsive styles */
          @media (max-width: 768px) {
            .mobile-container {
              padding: 16px !important;
              max-width: 100% !important;
            }
            
            .mobile-header {
              font-size: 1.5rem !important;
              margin: 0 60px !important;
            }
            
            .mobile-back-button, .mobile-admin-button {
              padding: 4px 8px !important;
              font-size: 0.7rem !important;
            }
            
            .mobile-grid-4 {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.5rem !important;
            }
            
            .mobile-grid-single {
              display: grid !important;
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
            }
            
            .mobile-category-card {
              padding: 0.75rem !important;
              font-size: 0.8rem !important;
              min-height: 100px !important;
            }
            
            .mobile-item-card {
              padding: 0.75rem !important;
              font-size: 0.8rem !important;
            }
            
            .mobile-text-sm {
              font-size: 0.9rem !important;
            }
            
            .mobile-text-xs {
              font-size: 0.75rem !important;
            }
            
            .mobile-button {
              padding: 12px 20px !important;
              font-size: 1rem !important;
            }
            
            .mobile-emoji-lg {
              font-size: 1.5rem !important;
            }
            
            .mobile-emoji-xl {
              font-size: 2rem !important;
            }
          }
          
          @media (max-width: 480px) {
            .mobile-container {
              padding: 12px !important;
            }
            
            .mobile-header {
              font-size: 1.25rem !important;
            }
            
            .mobile-very-small {
              font-size: 0.7rem !important;
              padding: 0.5rem !important;
            }
            
            .mobile-category-card {
              min-height: 80px !important;
              padding: 0.5rem !important;
            }
          }

          /* Touch drag preview */
          .touch-drag-preview {
            position: fixed;
            pointer-events: none;
            z-index: 1000;
            transform: translate(-50%, -50%);
            opacity: 0.8;
            background: white;
            padding: 0.5rem;
            border-radius: 8px;
            border: 2px solid #3b82f6;
            font-size: 0.8rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }} className="mobile-container">
        
        {/* Touch drag preview */}
        {dragPreview.show && touchDragItem && (
          <div 
            className="touch-drag-preview"
            style={{
              left: dragPreview.x,
              top: dragPreview.y
            }}
          >
            {touchDragItem.emoji} {touchDragItem.content}
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          padding: '32px',
          textAlign: 'center',
          maxWidth: '1000px',
          width: '100%'
        }} className="mobile-container">
          {/* Header with back button */}
          <div style={{position: 'relative', marginBottom: '2rem'}}>
            {onBackToMenu && gamePhase === 'instructions' && (
              <button 
                onClick={onBackToMenu}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  padding: '6px 12px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  zIndex: 10
                }}
                className="mobile-back-button"
              >
                ← Back
              </button>
            )}

            {/* Admin shortcut button */}
            {gamePhase === 'instructions' && (
              <button 
                onClick={() => setGamePhase('requesting')}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  padding: '6px 12px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  opacity: 0.7,
                  zIndex: 10
                }}
                className="mobile-admin-button"
                title="Admin: Skip to AI Generation"
              >
                🚀 Admin
              </button>
            )}

            <h1 style={{margin: '0 80px', textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#333'}} className="mobile-header">
              Data Detective
            </h1>
          </div>

          {/* Instructions */}
          {gamePhase === 'instructions' && (
            <div>
              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '2px solid #0ea5e9'
              }}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}} className="mobile-emoji-xl">🕵️</div>
                <h2 style={{fontSize: '1.8rem', color: '#0c4a6e', marginBottom: '1rem', fontWeight: 'bold'}} className="mobile-text-sm">
                  Help Train the AI!
                </h2>
                <p style={{fontSize: '1.1rem', color: '#0369a1', lineHeight: '1.6', marginBottom: '1.5rem'}} className="mobile-text-xs">
                  AI needs different types of data to learn! {isMobile ? 'Touch and drag' : 'Drag'} each data example into the correct category box to help prepare the training dataset. You'll get 3 random examples from each category.
                </p>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem'}} className="mobile-grid-4">
                  {Object.entries(categories).map(([key, category]) => (
                    <div key={key} style={{
                      padding: '1rem',
                      background: category.color,
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }} className="mobile-category-card">
                      <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}} className="mobile-emoji-lg">{category.emoji}</div>
                      <span className="mobile-text-xs">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={startSorting}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                className="mobile-button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                🚀 Start Sorting Data!
              </button>
            </div>
          )}

          {/* Sorting phase */}
          {gamePhase === 'sorting' && (
            <div>
              <div style={{marginBottom: '2rem'}}>
                <h2 style={{color: '#333', marginBottom: '1rem'}} className="mobile-text-sm">
                  📊 Sort the Data! ({12 - availableItems.length}/12 sorted)
                </h2>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${((12 - availableItems.length) / 12) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                
                {errorMessage && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#fee2e2',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }} className="mobile-text-xs">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
              }} className="mobile-grid-4">
                {Object.entries(categories).map(([key, category]) => {
                  const itemsInCategory = sortedItems[key as keyof typeof sortedItems] || [];
                  return (
                    <div
                      key={key}
                      data-drop-zone={key}
                      style={{
                        minHeight: '120px',
                        padding: '1rem',
                        background: draggedItem?.category === key || touchDragItem?.category === key ? '#f0f9ff' : '#f8fafc',
                        border: `3px dashed ${category.color}`,
                        borderRadius: '12px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      className="mobile-category-card"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, key)}
                    >
                      <div style={{fontSize: '2rem', marginBottom: '0.5rem'}} className="mobile-emoji-lg">
                        {category.emoji}
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: category.color,
                        marginBottom: '1rem'
                      }} className="mobile-text-xs">
                        {isMobile ? category.name.split(' ')[0] : category.name}
                      </div>
                      
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        {itemsInCategory.map((item) => {
                          const isIncorrect = incorrectItems.includes(item.id);
                          return (
                            <div 
                              key={item.id} 
                              draggable={!isMobile}
                              onDragStart={() => !isMobile && handleDragStart(item)}
                              onTouchStart={(e) => isMobile && handleTouchStart(e, item)}
                              onTouchMove={(e) => isMobile && handleTouchMove(e)}
                              onTouchEnd={(e) => isMobile && handleTouchEnd(e)}
                              style={{
                                padding: '0.5rem',
                                background: isIncorrect ? '#fee2e2' : 'rgba(255, 255, 255, 0.8)',
                                border: isIncorrect ? '2px solid #ef4444' : 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                color: isIncorrect ? '#dc2626' : '#374151',
                                fontWeight: isIncorrect ? '600' : 'normal',
                                cursor: 'grab',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                              }}
                              className="mobile-very-small"
                              onMouseEnter={(e) => {
                                if (!isMobile) {
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isMobile) {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              {item.emoji} {isMobile ? item.content.substring(0, 12) + '...' : item.content}
                              {isIncorrect && <span style={{marginLeft: '0.5rem'}}>❌</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{marginBottom: '2rem'}}>
                <h3 style={{color: '#333', marginBottom: '1rem'}} className="mobile-text-sm">
                  🗂️ {isMobile ? 'Touch and drag' : 'Drag'} these items to the correct categories:
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1rem'
                }} className="mobile-grid-single">
                  {availableItems.map((item) => (
                    <div
                      key={item.id}
                      draggable={!isMobile}
                      onDragStart={() => !isMobile && handleDragStart(item)}
                      onTouchStart={(e) => isMobile && handleTouchStart(e, item)}
                      onTouchMove={(e) => isMobile && handleTouchMove(e)}
                      onTouchEnd={(e) => isMobile && handleTouchEnd(e)}
                      style={{
                        padding: '1rem',
                        background: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'grab',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem',
                        userSelect: 'none'
                      }}
                      className="mobile-item-card"
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}} className="mobile-emoji-lg">
                        {item.emoji}
                      </div>
                      <div style={{fontWeight: '600', color: '#374151'}} className="mobile-text-xs">
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading phase */}
          {gamePhase === 'loading' && (
            <div>
              <div style={{
                padding: '3rem',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '16px',
                border: '2px solid #f59e0b',
                textAlign: 'center'
              }} className="mobile-container">
                <div style={{fontSize: '4rem', marginBottom: '2rem', animation: 'pulse 1.5s ease-in-out infinite'}} className="mobile-emoji-xl">
                  🤖
                </div>
                <h2 style={{fontSize: '2rem', color: '#92400e', marginBottom: '1rem', fontWeight: 'bold'}} className="mobile-text-sm">
                  Preparing AI...
                </h2>
                <p style={{fontSize: '1.2rem', color: '#b45309', marginBottom: '2rem'}} className="mobile-text-xs">
                  Loading the AI Generation Station
                </p>
                <div style={{
                  width: '200px',
                  height: '8px',
                  background: '#fbbf24',
                  borderRadius: '4px',
                  margin: '0 auto',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    animation: 'loading 2s ease-in-out'
                  }}></div>
                </div>
              </div>
            </div>
          )}

          {/* AI Requesting phase */}
          {gamePhase === 'requesting' && (
            <div>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #f59e0b'
              }} className="mobile-container">
                <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}} className="mobile-emoji-xl">🤖</div>
                <h2 style={{fontSize: '1.5rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: 'bold'}} className="mobile-text-sm">
                  AI Generation Station
                </h2>
                <p style={{fontSize: '1rem', color: '#b45309', marginBottom: '0.5rem'}} className="mobile-text-xs">
                  Click each data type to see what the AI creates!
                </p>
                <p style={{fontSize: '0.9rem', color: '#d97706'}} className="mobile-text-xs">
                  Generated: {requestedTypes.length}/4 data types
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
              }} className="mobile-grid-4">
                {Object.entries(categories).map(([key, category]) => {
                  const isRequested = requestedTypes.includes(key);
                  const isLoading = loadingTypes.includes(key);
                  const aiResult = aiGenerations[key];
                  
                  return (
                    <div key={key} style={{
                      padding: '1rem',
                      background: isRequested ? '#f0fdf4' : isLoading ? '#fef3c7' : 'white',
                      border: `2px solid ${category.color}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      minHeight: '140px'
                    }} className="mobile-category-card">
                      <div style={{fontSize: '2rem', marginBottom: '0.5rem'}} className="mobile-emoji-lg">
                        {category.emoji}
                      </div>
                      <h3 style={{
                        fontSize: '1rem',
                        color: category.color,
                        marginBottom: '0.5rem',
                        fontWeight: 'bold'
                      }} className="mobile-text-xs">
                        {category.name.split(' ')[0]}
                      </h3>
                      
                      {isLoading ? (
                        <div>
                          <div style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                            padding: '0.5rem',
                            background: 'rgba(251, 191, 36, 0.2)',
                            borderRadius: '8px',
                            border: '2px dashed #f59e0b',
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }} className="mobile-emoji-lg">
                            ⚡
                          </div>
                          <p style={{
                            color: '#d97706',
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }} className="mobile-text-xs">
                            Generating...
                          </p>
                        </div>
                      ) : !isRequested ? (
                        <button
                          onClick={() => handleAIRequest(key)}
                          style={{
                            padding: '8px 12px',
                            background: category.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          className="mobile-text-xs"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          🎯 Generate
                        </button>
                      ) : (
                        <div>
                          <div style={{
                            fontSize: '2.5rem',
                            marginBottom: '0.25rem',
                            padding: '0.5rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            border: '2px dashed #10b981'
                          }} className="mobile-emoji-lg">
                            {aiResult}
                          </div>
                          <p style={{
                            color: '#059669',
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }} className="mobile-text-xs">
                            ✅ Generated!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {requestedTypes.length === 4 && (
                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: '2px solid #10b981'
                }} className="mobile-container">
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}} className="mobile-emoji-lg">🎊</div>
                  <h3 style={{fontSize: '1.25rem', color: '#065f46', marginBottom: '0.5rem'}} className="mobile-text-sm">
                    Mission Complete!
                  </h3>
                  <p style={{color: '#047857', fontSize: '1rem'}} className="mobile-text-xs">
                    Great work! You've learned how AI uses training data to generate content.
                  </p>
                </div>
              )}

              <div style={{textAlign: 'center'}}>
                <button 
                  onClick={resetGame}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginRight: '1rem'
                  }}
                  className="mobile-button"
                >
                  🔄 Play Again
                </button>

                {onBackToMenu && (
                  <button 
                    onClick={() => {
                      // Stop completion audio when going back to menu
                      if (completionAudioRef.current) {
                        completionAudioRef.current.pause();
                        completionAudioRef.current = null;
                      }
                      onBackToMenu();
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                    className="mobile-button"
                  >
                    🏠 Back to Games
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DataAI;