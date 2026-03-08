import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaTimes, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const ProductReelFloat = ({ reels }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [visible, setVisible] = useState(false);
  const stampVideoRef = useRef(null);
  const fullVideoRef = useRef(null);

  // Show stamp after a short delay
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Auto-play stamp preview (muted, looping)
  useEffect(() => {
    if (!stampVideoRef.current) return;
    if (visible && !open) {
      stampVideoRef.current.play().catch(() => {});
    } else {
      stampVideoRef.current.pause();
    }
  }, [visible, open]);

  // Play/pause fullscreen video when modal opens/closes
  useEffect(() => {
    if (!fullVideoRef.current) return;
    if (open) {
      fullVideoRef.current.currentTime = 0;
      fullVideoRef.current.play().catch(() => {});
    } else {
      fullVideoRef.current.pause();
    }
  }, [open, activeIndex]);

  if (!reels || reels.length === 0) return null;

  const reel = reels[activeIndex];
  const stampReel = reels[0];

  const handleOpen = () => {
    setActiveIndex(0);
    setOpen(true);
    if (stampVideoRef.current) stampVideoRef.current.pause();
  };

  const handleClose = () => {
    setOpen(false);
    if (fullVideoRef.current) fullVideoRef.current.pause();
    // Resume stamp preview
    if (stampVideoRef.current) stampVideoRef.current.play().catch(() => {});
  };

  return (
    <>
      {/* Floating Stamp — fixed right side, vertically centered */}
      <div
        className="fixed right-3 z-40 transition-all duration-500"
        style={{
          top: '50%',
          transform: visible ? 'translateY(-50%)' : 'translateY(-50%) translateX(56px)',
          opacity: visible ? 1 : 0,
        }}
      >
        <button
          onClick={handleOpen}
          className="group relative w-20 h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-white hover:border-[#5A0F1B] transition-all duration-200 hover:scale-105 active:scale-95"
          title="Watch product video"
        >
          {/* Live video preview in stamp — muted, looping */}
          <video
            ref={stampVideoRef}
            src={stampReel.videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="auto"
            poster={stampReel.thumbnailUrl || undefined}
          />

          {/* Subtle dark vignette + centered play icon */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
              <FaPlay className="text-[#5A0F1B] text-sm ml-0.5" />
            </div>
          </div>

          {/* Reel count badge */}
          {reels.length > 1 && (
            <div className="absolute top-1.5 right-1.5 bg-[#5A0F1B] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {reels.length}
            </div>
          )}

          {/* Bottom label */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 text-center">
            <span className="text-white text-[9px] font-bold tracking-widest">▶ WATCH</span>
          </div>
        </button>
      </div>

      {/* Fullscreen Video Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-sm h-full max-h-screen flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={fullVideoRef}
              src={reel.videoUrl}
              className="w-full max-h-screen object-contain"
              loop
              playsInline
              muted={muted}
              autoPlay
            />

            {/* Top controls */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4">
              <button
                onClick={() => setMuted(!muted)}
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                {muted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            {/* Multi-reel navigation dots */}
            {reels.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                {reels.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Product name */}
            {reel.product?.name && (
              <div className="absolute bottom-16 left-4 right-4">
                <p className="text-white text-sm font-semibold drop-shadow-lg line-clamp-1">
                  🎬 {reel.product.name}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReelFloat;
