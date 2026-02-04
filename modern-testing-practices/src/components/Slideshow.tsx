import { useState, useEffect, useCallback } from 'react';
import { slides, categories } from '../slides/slideData';
import type { SlideContent } from '../slides/slideData';
import './Slideshow.css';

export function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNav, setShowNav] = useState(false);

  const currentSlide = slides[currentIndex];
  const progress = ((currentIndex + 1) / slides.length) * 100;

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentIndex(index);
      setShowNav(false);
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        setShowNav(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="slideshow">
      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Navigation toggle */}
      <button className="nav-toggle" onClick={() => setShowNav(!showNav)}>
        ☰
      </button>

      {/* Slide navigation panel */}
      {showNav && (
        <div className="nav-panel">
          <div className="nav-header">
            <h3>Slides</h3>
            <button onClick={() => setShowNav(false)}>×</button>
          </div>
          <div className="nav-content">
            {categories.map(category => (
              <div key={category} className="nav-category">
                <h4>{category}</h4>
                {slides
                  .filter(s => s.category === category)
                  .map((slide) => {
                    const globalIdx = slides.findIndex(s => s.id === slide.id);
                    return (
                      <button
                        key={slide.id}
                        className={`nav-item ${globalIdx === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(globalIdx)}
                      >
                        {slide.title}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main slide content */}
      <div className="slide" onClick={nextSlide}>
        <div className="slide-header">
          <span className="slide-category">{currentSlide.category}</span>
          <span className="slide-counter">{currentIndex + 1} / {slides.length}</span>
        </div>
        
        <h1 className="slide-title">{currentSlide.title}</h1>
        {currentSlide.subtitle && (
          <h2 className="slide-subtitle">{currentSlide.subtitle}</h2>
        )}

        <div className="slide-content">
          {currentSlide.content.map((content, idx) => (
            <SlideContentRenderer key={idx} content={content} />
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="slide-nav">
        <button 
          className="nav-arrow prev" 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          disabled={currentIndex === 0}
        >
          ←
        </button>
        <button 
          className="nav-arrow next" 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          disabled={currentIndex === slides.length - 1}
        >
          →
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="keyboard-hint">
        Use ← → or Space to navigate
      </div>
    </div>
  );
}

function SlideContentRenderer({ content }: { content: SlideContent }) {
  switch (content.type) {
    case 'text':
      return <p className="content-text">{content.value}</p>;
    
    case 'bullets':
      return (
        <ul className="content-bullets">
          {content.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    
    case 'code':
      return (
        <pre className="content-code">
          <code>{content.value}</code>
        </pre>
      );
    
    case 'diagram':
      return (
        <pre className="content-diagram">
          {content.value}
        </pre>
      );
    
    case 'image':
      return (
        <div className="content-image">
          <img 
            src={content.src} 
            alt={content.alt} 
            style={{ maxHeight: content.maxHeight || '400px' }}
          />
        </div>
      );
    
    case 'comparison':
      return (
        <div className="content-comparison">
          <div className="comparison-side left">
            <h4>{content.left.title}</h4>
            <ul>
              {content.left.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="comparison-side right">
            <h4>{content.right.title}</h4>
            <ul>
              {content.right.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    
    case 'steps':
      return (
        <div className="content-steps">
          {content.items.map((step, idx) => (
            <div key={idx} className="step">
              <div className="step-number">{idx + 1}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
    
    default:
      return null;
  }
}
