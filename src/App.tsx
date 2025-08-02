import { useState } from 'react'
import TrainAIGame from './games/TrainAIGame'
import GuessAI from './games/GuessAI'

function App() {
  const [currentGame, setCurrentGame] = useState<'menu' | 'train' | 'guess'>('menu');

  if (currentGame === 'train') {
    return <TrainAIGame onBackToMenu={() => setCurrentGame('menu')} />;
  }
    
  if (currentGame === 'guess') {
    return <GuessAI onBackToMenu={() => setCurrentGame('menu')} />;
  }

  // Enhanced Game selection menu with inline styles
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '-40px',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '250px',
        height: '250px',
        background: 'rgba(255, 255, 0, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '80px',
        width: '280px',
        height: '280px',
        background: 'rgba(255, 182, 193, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 7s ease-in-out infinite'
      }}></div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '450px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Logo/Brand area */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: '16px',
            marginBottom: '20px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
            fontSize: '36px'
          }}>
            🎓
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Teachrly Games
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            Choose an AI learning adventure!
          </p>
        </div>

        {/* Game buttons */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => setCurrentGame('train')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              marginBottom: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(139, 92, 246, 0.3)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '32px' }}>🐱</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Train AI with Pets</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Teach computers to recognize cats & dogs</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentGame('guess')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '32px' }}>🤔</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Guess AI</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Spot AI in everyday situations</div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span>🚀</span>
            <span>Building the future of AI education</span>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
            }
          }
        `
      }} />
    </div>
  );
}

export default App