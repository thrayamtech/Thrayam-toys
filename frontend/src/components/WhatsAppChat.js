import { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WHATSAPP_NUMBER = '918807259471';

const WhatsAppChat = ({ product }) => {
  const [open, setOpen] = useState(false);

  const isProduct = !!product;

  const defaultMessage = isProduct
    ? `Hi Thrayam Threads! 👋\n\nI'm interested in this saree:\n*${product.name}*\n\nCould you please share more details about availability, colours, and delivery?\n\nThank you! 🙏`
    : `Hi Thrayam Threads! 👋\n\nI visited your website and I'm interested in your saree collection. Could you help me find the right saree?\n\nThank you! 🙏`;

  const [message, setMessage] = useState(defaultMessage);

  const handleOpen = () => {
    // Reset message in case product changes (on product page)
    setMessage(isProduct
      ? `Hi Thrayam Threads! 👋\n\nI'm interested in this saree:\n*${product.name}*\n\nCould you please share more details about availability, colours, and delivery?\n\nThank you! 🙏`
      : `Hi Thrayam Threads! 👋\n\nI visited your website and I'm interested in your saree collection. Could you help me find the right saree?\n\nThank you! 🙏`
    );
    setOpen(true);
  };

  const handleSend = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={`fixed right-5 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bc5a] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isProduct ? 'bottom-24 lg:bottom-6' : 'bottom-6'}`}
        title="Chat on WhatsApp"
        style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.5)' }}
      >
        <FaWhatsapp className="text-3xl" />
        {/* Pulse ring */}
        <span className="absolute w-14 h-14 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
      </button>

      {/* Chat Popup */}
      {open && (
        <div className={`fixed right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-slideUpChat ${isProduct ? 'bottom-44 lg:bottom-24' : 'bottom-24'}`}>
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <FaWhatsapp className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm leading-tight">Thrayam Threads</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white/80 inline-block"></span>
                <p className="text-white/80 text-xs">Typically replies within minutes</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Chat Bubble Preview */}
          <div className="bg-[#ece5dd] px-4 py-3 min-h-[80px]">
            <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm max-w-[90%] inline-block">
              {isProduct ? (
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {`Hi Thrayam Threads! 👋\n\nI'm interested in:\n`}
                  <span className="font-bold text-[#5A0F1B]">{product.name}</span>
                  {`\n\nCould you share details on availability & delivery?`}
                </p>
              ) : (
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {`Hi Thrayam Threads! 👋\n\nI'm interested in your saree collection. Could you help me find the right one?`}
                </p>
              )}
              <p className="text-[10px] text-gray-400 text-right mt-1">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Editable Message */}
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Edit your message (optional):</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#25D366] transition-colors"
            />
            <button
              onClick={handleSend}
              className="mt-2 w-full bg-[#25D366] hover:bg-[#20bc5a] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
            >
              <FaWhatsapp className="text-base" />
              Start Chat on WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppChat;
