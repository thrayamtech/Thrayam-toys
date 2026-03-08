import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import API from '../utils/api';
import { getProductImage, handleImageError } from '../utils/imageHelper';

const NAMES = [
  // Tamil names
  'Ananya', 'Kavya', 'Priya', 'Divya', 'Meena', 'Lakshmi', 'Saranya', 'Deepa',
  'Swetha', 'Nithya', 'Revathi', 'Geetha', 'Sangeetha', 'Pavithra', 'Arthi',
  'Vimala', 'Malathi', 'Sumathi', 'Renuka', 'Selvi', 'Mythili', 'Kamala',
  'Bharathi', 'Lavanya', 'Nandini', 'Ramya', 'Sujatha', 'Thenmozhi', 'Vijaya',
  'Alamelu', 'Ananthi', 'Ezhilarasi', 'Indira', 'Janaki', 'Kokila', 'Malliga',
  'Nalini', 'Oviya', 'Parkavi', 'Rajalakshmi', 'Sivaranjani', 'Tamilselvi',
  'Vennila', 'Pooja', 'Yamuna',
  // Malayalam names
  'Anjali', 'Athira', 'Devika', 'Gayathri', 'Haritha', 'Keerthana', 'Lekha',
  'Neethu', 'Parvathi', 'Remya', 'Treesa', 'Varsha', 'Reshma', 'Sneha',
  'Sreelakshmi', 'Amrutha', 'Bindhu', 'Chithra', 'Dhanya', 'Fathima',
];

const CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli',
  'Vellore', 'Erode', 'Thoothukudi', 'Thanjavur', 'Kanchipuram', 'Tiruppur',
  'Dindigul', 'Nagercoil', 'Kumbakonam',
  'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam',
  'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram',
  'Bengaluru', 'Mysuru',
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const LivePurchaseNotification = () => {
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const hideRef = useRef(null);
  const navigate = useNavigate();

  // Fetch a pool of real products once on mount
  useEffect(() => {
    API.get('/products?limit=50')
      .then(({ data }) => {
        if (data.products?.length) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const showNext = (productPool) => {
    if (!productPool.length) return;

    const product = rand(productPool);
    setNotification({
      name: rand(NAMES),
      city: rand(CITIES),
      product,
      minutes: randInt(2, 10),
    });
    setVisible(true);

    hideRef.current = setTimeout(() => setVisible(false), 6000);
    timerRef.current = setTimeout(() => showNext(productPool), randInt(20000, 35000));
  };

  // Start showing notifications once products are loaded
  useEffect(() => {
    if (!products.length) return;
    timerRef.current = setTimeout(() => showNext(products), randInt(5000, 10000));
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(hideRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const handleClick = () => {
    if (notification?.product?._id) {
      navigate(`/products/${notification.product._id}`);
      setVisible(false);
    }
  };

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-5 left-4 z-50 max-w-[300px] transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div
        onClick={handleClick}
        className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3 flex items-start gap-3 cursor-pointer hover:shadow-3xl hover:scale-[1.02] transition-all duration-200 group"
      >
        {/* Product Image */}
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
          <img
            src={getProductImage(notification.product)}
            alt={notification.product.name}
            onError={(e) => handleImageError(e, 'product')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 leading-tight">
            🛍️ {notification.name}{' '}
            <span className="font-normal text-gray-500">from</span>{' '}
            {notification.city}
          </p>
          <p className="text-xs text-gray-600 mt-0.5 leading-tight line-clamp-2">
            just bought{' '}
            <span className="font-semibold text-[#5A0F1B]">{notification.product.name}</span>
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-gray-400">
              ⏱️ {notification.minutes} min ago
            </p>
            <span className="text-[10px] text-[#5A0F1B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default LivePurchaseNotification;
