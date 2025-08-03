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

  // Function to get 3 random items from each category
  const getRandomizedItems = () => {
    const categoryKeys = ['picture', 'word', 'sound', 'number'];
    const selectedItems: DataItem[] = [];

    categoryKeys.forEach(category => {
      const categoryItems = dataItems.filter(item => item.category === category);
      const shuffled = [...categoryItems].sort(() => Math.random() - 0.5);
      selectedItems.push(...shuffled.slice(0, 3));
    });

    return selectedItems.sort(() => Math.random() - 0.5);
  };

  const startSorting = () => {
    setAvailableItems(getRandomizedItems());
    setGamePhase('sorting');
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, item: DataItem) => {
    e.preventDefault();
    setTouchDragItem(item);
    const touch = e.touches[0];
    setDragPreview({
      x: touch.clientX,
      y: touch.clientY,
      show: true
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragItem) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    setDragPreview({
      x: touch.clientX,
      y: touch.clientY,
      show: true
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchDragItem) return;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the drop zone
    const dropZone = elementBelow?.closest('[data-drop-zone]');
    if (dropZone) {
      const category = dropZone.getAttribute('data-drop-zone');
      if (category) {
        handleDrop(null, category, touchDragItem);
      }
    }
    
    setTouchDragItem(null);
    setDragPreview({ x: 0, y: 0, show: false });
  };

  // Desktop drag handlers
  const handleDragStart = (item: DataItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent | null, targetCategory: string, item: DataItem | null = null) => {
    if (e) e.preventDefault();
    
    const itemToMove = item || draggedItem;
    if (!itemToMove) return;
    
    const isCorrect = itemToMove.category === targetCategory;
    
    // Remove item from wherever it currently is
    setAvailableItems(prev => prev.filter(i => i.id !== itemToMove.id));
    setSortedItems(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(category => {
        updated[category as keyof typeof updated] = updated[category as keyof typeof updated].filter(i => i.id !== itemToMove.id);
      });
      return updated;
    });
    
    if (isCorrect) {
      playCorrectSound();
      setErrorMessage('');
      setIncorrectItems(prev => prev.filter(id => id !== itemToMove.id));
      
      setSortedItems(prev => ({
        ...prev,
        [targetCategory]: [...prev[targetCategory as keyof typeof prev], itemToMove]
      }));
    } else {
      playWrongSound();
      
      const categoryNames = {
        picture: 'Picture Data',
        word: 'Word Data', 
        sound: 'Sound Data',
        number: 'Number Data'
      };
      
      const correctCategoryName = categoryNames[itemToMove.category as keyof typeof categoryNames];
      const wrongCategoryName = categoryNames[targetCategory as keyof typeof categoryNames];
      setErrorMessage(`❌ "${itemToMove.content}" belongs in ${correctCategoryName}, not ${wrongCategoryName}!`);
      
      setIncorrectItems(prev => [...prev.filter(id => id !== itemToMove.id), itemToMove.id]);
      setSortedItems(prev => ({
        ...prev,
        [targetCategory]: [...prev[targetCategory as keyof typeof prev], itemToMove]
      }));
      
      setTimeout(() => {
        setErrorMessage('');
      }, 4000);
    }
    
    setDraggedItem(null);
  };

  const handleAIRequest = (dataType: string) => {
    if (requestedTypes.includes(dataType) || loadingTypes.includes(dataType)) return;

    setLoadingTypes(prev => [...prev, dataType]);

    setTimeout(() => {
      const symbols = aiSymbols[dataType as keyof typeof aiSymbols];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      setLoadingTypes(prev => prev.filter(type => type !== dataType));
      setRequestedTypes(prev => [...prev, dataType]);
      setAiGenerations(prev => ({ ...prev, [dataType]: randomSymbol }));
    }, 2000);
  };

  const resetGame = () => {
    setGamePhase('instructions');
    setAvailableItems([]);
    setSortedItems({ picture: [], word: [], sound: [], number: [] });
    setRequestedTypes([]);
    setAiGenerations({});
    setErrorMessage('');
    setIncorrectItems([]);
    setLoadingTypes([]);
  };

  // Check for game completion
  useEffect(() => {
    if (gamePhase === 'sorting') {
      const totalItemsInCategories = Object.values(sortedItems).flat().length;
      const hasIncorrectItems = incorrectItems.length > 0;
      const noAvailableItems = availableItems.length === 0;
      
      if (totalItemsInCategories === 12 && !hasIncorrectItems && noAvailableItems) {
        setTimeout(() => setGamePhase('loading'), 500);
      }
    }
  }, [sortedItems, incorrectItems, availableItems, gamePhase]);

  // Handle loading phase transition
  useEffect(() => {
    if (gamePhase === 'loading') {
      setTimeout(() => {
        setGamePhase('requesting');
      }, 2000);
    }
  }, [gamePhase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 text-center max-w-6xl w-full">
        {/* Touch drag preview */}
        {dragPreview.show && touchDragItem && (
          <div 
            style={{
              position: 'fixed',
              left: dragPreview.x,
              top: dragPreview.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 1000,
              opacity: 0.8,
              background: 'white',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid #3b82f6',
              fontSize: '0.8rem'
            }}
          >
            {touchDragItem.emoji} {touchDragItem.content}
          </div>
        )}

        {/* Header */}
        <div className="relative mb-6">
          {onBackToMenu && gamePhase === 'instructions' && (
            <button 
              onClick={onBackToMenu}
              className="absolute left-0 top-0 px-3 py-1 bg-gray-600 text-white border-none rounded cursor-pointer text-sm"
            >
              ← Back to Games
            </button>
          )}

          {gamePhase === 'instructions' && (
            <button 
              onClick={() => setGamePhase('requesting')}
              className="absolute right-0 top-0 px-3 py-1 bg-red-600 text-white border-none rounded cursor-pointer text-sm opacity-70"
            >
              🚀 Admin
            </button>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Data Detective
          </h1>
        </div>

        {/* Instructions */}
        {gamePhase === 'instructions' && (
          <div>
            <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl mb-6 border-2 border-blue-300">
              <div className="text-4xl md:text-6xl mb-4">🕵️</div>
              <h2 className="text-xl md:text-2xl text-blue-900 mb-4 font-bold">
                Help Train the AI!
              </h2>
              <p className="text-sm md:text-lg text-blue-700 leading-relaxed mb-6">
                AI needs different types of data to learn! {isMobile ? 'Tap and drag' : 'Drag'} each data example into the correct category box to help prepare the training dataset.
              </p>
              
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 md:gap-4 mb-6`}>
                {Object.entries(categories).map(([key, category]) => (
                  <div key={key} className="p-2 md:p-4 text-white rounded-lg text-xs md:text-sm font-semibold" style={{background: category.color}}>
                    <div className="text-lg md:text-2xl mb-1">{category.emoji}</div>
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={startSorting}
              className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-xl cursor-pointer text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🚀 Start Sorting Data!
            </button>
          </div>
        )}

        {/* Sorting phase */}
        {gamePhase === 'sorting' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg md:text-xl text-gray-800 mb-4">
                📊 Sort the Data! ({12 - availableItems.length}/12 sorted)
              </h2>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                  style={{width: `${((12 - availableItems.length) / 12) * 100}%`}}
                ></div>
              </div>
              
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 border-2 border-red-400 rounded-lg text-red-700 font-semibold text-sm">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Category boxes */}
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 md:gap-4 mb-6`}>
              {Object.entries(categories).map(([key, category]) => {
                const itemsInCategory = sortedItems[key as keyof typeof sortedItems] || [];
                return (
                  <div
                    key={key}
                    data-drop-zone={key}
                    className={`${isMobile ? 'min-h-20' : 'min-h-32'} p-2 md:p-4 bg-gray-50 rounded-xl text-center transition-all duration-300`}
                    style={{
                      border: `3px dashed ${category.color}`,
                      background: draggedItem?.category === key || touchDragItem?.category === key ? '#f0f9ff' : '#f8fafc'
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <div className="text-xl md:text-3xl mb-1">
                      {category.emoji}
                    </div>
                    <div className="text-xs md:text-sm font-semibold mb-2" style={{color: category.color}}>
                      {isMobile ? category.name.split(' ')[0] : category.name}
                    </div>
                    
                    <div className="flex flex-col gap-1">
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
                            className={`p-1 md:p-2 rounded text-xs ${isIncorrect ? 'bg-red-100 border-2 border-red-400 text-red-700' : 'bg-white bg-opacity-80'} cursor-grab transition-all duration-200`}
                          >
                            {item.emoji} {isMobile ? item.content.substring(0, 15) + '...' : item.content}
                            {isIncorrect && <span className="ml-1">❌</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available items */}
            <div className="mb-6">
              <h3 className="text-sm md:text-lg text-gray-800 mb-4">
                🗂️ {isMobile ? 'Tap and drag' : 'Drag'} these items to the correct categories:
              </h3>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-2 md:gap-4`}>
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    draggable={!isMobile}
                    onDragStart={() => !isMobile && handleDragStart(item)}
                    onTouchStart={(e) => isMobile && handleTouchStart(e, item)}
                    onTouchMove={(e) => isMobile && handleTouchMove(e)}
                    onTouchEnd={(e) => isMobile && handleTouchEnd(e)}
                    className="p-3 md:p-4 bg-white border-2 border-gray-200 rounded-lg cursor-grab text-center transition-all duration-200 hover:shadow-lg hover:border-blue-400"
                  >
                    <div className="text-lg md:text-2xl mb-1">
                      {item.emoji}
                    </div>
                    <div className="font-semibold text-gray-700 text-xs md:text-sm">
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
          <div className="p-6 md:p-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl border-2 border-yellow-400 text-center">
            <div className="text-4xl md:text-6xl mb-6 animate-pulse">🤖</div>
            <h2 className="text-xl md:text-2xl text-yellow-800 mb-4 font-bold">Preparing AI...</h2>
            <p className="text-sm md:text-lg text-yellow-700 mb-6">Loading the AI Generation Station</p>
            <div className="w-48 h-2 bg-yellow-300 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-600 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* AI Requesting phase */}
        {gamePhase === 'requesting' && (
          <div>
            <div className="p-4 md:p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl mb-6 border-2 border-yellow-400">
              <div className="text-3xl md:text-4xl mb-2">🤖</div>
              <h2 className="text-lg md:text-xl text-yellow-800 mb-2 font-bold">AI Generation Station</h2>
              <p className="text-sm md:text-base text-yellow-700 mb-2">Click each data type to see what the AI creates!</p>
              <p className="text-xs md:text-sm text-yellow-600">Generated: {requestedTypes.length}/4 data types</p>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 md:gap-4 mb-6`}>
              {Object.entries(categories).map(([key, category]) => {
                const isRequested = requestedTypes.includes(key);
                const isLoading = loadingTypes.includes(key);
                const aiResult = aiGenerations[key];
                
                return (
                  <div key={key} className={`p-3 md:p-4 rounded-xl text-center transition-all duration-300 ${isMobile ? 'min-h-24' : 'min-h-36'}`} 
                       style={{
                         background: isRequested ? '#f0fdf4' : isLoading ? '#fef3c7' : 'white',
                         border: `2px solid ${category.color}`
                       }}>
                    <div className="text-lg md:text-2xl mb-1">{category.emoji}</div>
                    <h3 className="text-xs md:text-sm font-bold mb-2" style={{color: category.color}}>
                      {category.name.split(' ')[0]}
                    </h3>
                    
                    {isLoading ? (
                      <div>
                        <div className="text-lg md:text-xl mb-1 p-2 bg-yellow-100 rounded border-2 border-dashed border-yellow-400 animate-pulse">⚡</div>
                        <p className="text-yellow-600 font-semibold text-xs">Generating...</p>
                      </div>
                    ) : !isRequested ? (
                      <button
                        onClick={() => handleAIRequest(key)}
                        className="px-2 py-1 md:px-3 md:py-2 text-white border-none rounded cursor-pointer text-xs md:text-sm font-semibold transition-all duration-200 hover:scale-105"
                        style={{background: category.color}}
                      >
                        🎯 Generate
                      </button>
                    ) : (
                      <div>
                        <div className="text-xl md:text-2xl mb-1 p-2 bg-green-50 rounded border-2 border-dashed border-green-400">
                          {aiResult}
                        </div>
                        <p className="text-green-600 font-semibold text-xs">✅ Generated!</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {requestedTypes.length === 4 && (
              <div className="p-4 md:p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-xl mb-6 border-2 border-green-400">
                <div className="text-2xl md:text-3xl mb-2">🎊</div>
                <h3 className="text-lg md:text-xl text-green-800 mb-2">Mission Complete!</h3>
                <p className="text-green-700 text-sm md:text-base">
                  Great work! You've learned how AI uses training data to generate content.
                </p>
              </div>
            )}

            <div className="text-center">
              <button 
                onClick={resetGame}
                className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg cursor-pointer text-sm md:text-base font-semibold mr-2 md:mr-4"
              >
                🔄 Play Again
              </button>

              {onBackToMenu && (
                <button 
                  onClick={onBackToMenu}
                  className="px-4 py-2 md:px-6 md:py-3 bg-gray-600 text-white border-none rounded-lg cursor-pointer text-sm md:text-base font-semibold"
                >
                  🏠 Back to Games
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAI;