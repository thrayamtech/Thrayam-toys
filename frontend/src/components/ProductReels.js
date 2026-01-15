import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaInstagram, FaExternalLinkAlt } from 'react-icons/fa';

const ProductReels = ({ reels }) => {
  const [selectedReelIndex, setSelectedReelIndex] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Extract Instagram reel ID from URL
  const getInstagramReelId = (url) => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Handle opening reel in popup
  const openReelPopup = (index) => {
    if (isDragging.current) return;
    setSelectedReelIndex(index);
  };

  // Handle closing popup
  const closePopup = () => {
    setSelectedReelIndex(null);
  };

  // Handle next/previous reel
  const goToNextReel = () => {
    if (selectedReelIndex < reels.length - 1) {
      setSelectedReelIndex(selectedReelIndex + 1);
    }
  };

  const goToPreviousReel = () => {
    if (selectedReelIndex > 0) {
      setSelectedReelIndex(selectedReelIndex - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedReelIndex === null) return;

      if (e.key === 'Escape') {
        closePopup();
      } else if (e.key === 'ArrowRight') {
        goToNextReel();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousReel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReelIndex]);

  // Scroll carousel functions
  const scrollCarousel = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Mouse drag to scroll
  const handleMouseDown = (e) => {
    if (e.target.closest('.reel-card')) return;

    if (scrollContainerRef.current) {
      isDragging.current = false;
      startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
      scrollLeft.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleMouseMove = (e) => {
    if (startX.current === 0) return;

    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = Math.abs(x - startX.current);

    if (walk > 5) {
      isDragging.current = true;
      e.preventDefault();

      if (scrollContainerRef.current) {
        const distance = (x - startX.current) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft.current - distance;
        scrollContainerRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    startX.current = 0;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }

    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  // Check scroll position on mount and scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [reels]);

  if (!reels || reels.length === 0) return null;

  const selectedReel = selectedReelIndex !== null ? reels[selectedReelIndex] : null;

  return (
    <>
      {/* Reels Grid */}
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaInstagram className="text-2xl text-pink-500" />
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900">
                Trending Styles
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base">
              Watch our latest collection in action
            </p>
          </div>

          {/* Reels Carousel - Horizontal Scrollable */}
          <div className="relative group">
            {/* Left Scroll Button */}
            {showLeftArrow && (
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-lg" />
              </button>
            )}

            {/* Right Scroll Button */}
            {showRightArrow && (
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-lg" />
              </button>
            )}

            {/* Scroll Container with Mouse Drag */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <div className="flex gap-3 md:gap-4 pb-4">
                {reels.map((reel, index) => (
                  <div
                    key={reel._id || index}
                    className="reel-card relative aspect-[9/16] w-[180px] sm:w-[200px] md:w-[220px] flex-shrink-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-shadow"
                    onClick={() => openReelPopup(index)}
                  >
                    {/* Thumbnail or Instagram Icon */}
                    {reel.thumbnailUrl ? (
                      <img
                        src={reel.thumbnailUrl}
                        alt={reel.title || 'Reel thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-pink-600">
                        <FaInstagram className="text-6xl text-white opacity-80" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <FaInstagram className="text-white text-2xl" />
                        </div>
                      </div>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      {reel.title && (
                        <h3 className="text-white text-xs md:text-sm font-medium line-clamp-2 mb-1">
                          {reel.title}
                        </h3>
                      )}
                      {reel.product?.name && (
                        <p className="text-white/80 text-xs line-clamp-1">
                          {reel.product.name}
                        </p>
                      )}
                    </div>

                    {/* Instagram Badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <FaInstagram className="text-xs" />
                      <span>Reel</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Screen Popup with Instagram Embed */}
      {selectedReelIndex !== null && selectedReel && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden">
          {/* Close Button */}
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Navigation Arrows */}
          {selectedReelIndex > 0 && (
            <button
              onClick={goToPreviousReel}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Previous"
            >
              <FaChevronLeft className="text-xl" />
            </button>
          )}

          {selectedReelIndex < reels.length - 1 && (
            <button
              onClick={goToNextReel}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Next"
            >
              <FaChevronRight className="text-xl" />
            </button>
          )}

          {/* Progress Indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-40">
            {reels.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === selectedReelIndex
                    ? 'w-8 bg-white'
                    : 'w-1 bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Instagram Embed Container */}
          <div className="relative w-full max-w-[400px] h-[85vh] max-h-[700px] flex flex-col items-center justify-center">
            {/* Reel Info */}
            {selectedReel.title && (
              <div className="absolute top-12 left-0 right-0 text-center z-30">
                <h3 className="text-white text-lg font-medium px-4">
                  {selectedReel.title}
                </h3>
              </div>
            )}

            {/* Instagram Embed iframe */}
            <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.instagram.com/reel/${getInstagramReelId(selectedReel.instagramUrl)}/embed`}
                className="w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                title={selectedReel.title || 'Instagram Reel'}
              />
            </div>

            {/* Open in Instagram Link */}
            <a
              href={selectedReel.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
            >
              <FaInstagram />
              <span>Open in Instagram</span>
              <FaExternalLinkAlt className="text-xs" />
            </a>

            {/* Linked Product Info */}
            {selectedReel.product && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 w-full max-w-[350px]">
                <div className="flex items-center gap-3">
                  {selectedReel.product.images?.[0] && (
                    <img
                      src={selectedReel.product.images[0]}
                      alt={selectedReel.product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium line-clamp-1">
                      {selectedReel.product.name}
                    </h4>
                    <p className="text-white/80 text-sm font-bold">
                      ₹{(selectedReel.product.salePrice || selectedReel.product.price)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Touch Swipe Area for Mobile */}
          <div
            className="absolute inset-0 md:hidden z-10"
            onTouchStart={(e) => {
              const touchStart = e.touches[0].clientX;
              const handleTouchEnd = (endEvent) => {
                const touchEnd = endEvent.changedTouches[0].clientX;
                const diff = touchStart - touchEnd;

                if (Math.abs(diff) > 50) {
                  if (diff > 0) {
                    goToNextReel();
                  } else {
                    goToPreviousReel();
                  }
                }

                document.removeEventListener('touchend', handleTouchEnd);
              };

              document.addEventListener('touchend', handleTouchEnd);
            }}
          />
        </div>
      )}
    </>
  );
};

export default ProductReels;
