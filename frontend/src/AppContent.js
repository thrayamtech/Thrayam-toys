import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useCart } from './context/CartContext';
import analytics from './utils/analytics';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import CheckoutSteps from './pages/CheckoutSteps';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Wallet from './pages/Wallet';
import ReferFriend from './pages/ReferFriend';
import Categories from './pages/Categories';
import AboutUs from './pages/AboutUs';
import Blogs from './pages/Blogs';
import ContactUs from './pages/ContactUs';
import PaymentFailure from './pages/PaymentFailure';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';
import AdminSliders from './pages/admin/Sliders';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';
import LoyaltySettings from './pages/admin/LoyaltySettings';
import ReferralTracking from './pages/admin/ReferralTracking';
import Analytics from './pages/admin/Analytics';

function AppContent() {
  const { isCartSidebarOpen, setIsCartSidebarOpen } = useCart();
  const location = useLocation();

  // Initialize analytics on mount
  useEffect(() => {
    analytics.init();
  }, []);

  // Track page views on route change
  useEffect(() => {
    const pageTitles = {
      '/': 'Home',
      '/products': 'Products',
      '/cart': 'Shopping Cart',
      '/checkout': 'Checkout',
      '/login': 'Login',
      '/register': 'Register',
      '/profile': 'My Profile',
      '/orders': 'My Orders',
      '/wishlist': 'Wishlist',
      '/wallet': 'Wallet',
      '/refer': 'Refer a Friend',
      '/categories': 'Categories',
      '/about': 'About Us',
      '/blogs': 'Blogs',
      '/contact': 'Contact Us'
    };

    const title = pageTitles[location.pathname] || document.title;
    analytics.trackPageView(location.pathname, title);
  }, [location]);

  return (
    <Routes>
      {/* Admin Routes - No Navbar/Footer */}
      <Route
        path="/admin/*"
        element={
          <Routes>
            <Route
              path="/"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <AdminRoute>
                  <AdminCategories />
                </AdminRoute>
              }
            />
            <Route
              path="/coupons"
              element={
                <AdminRoute>
                  <AdminCoupons />
                </AdminRoute>
              }
            />
            <Route
              path="/sliders"
              element={
                <AdminRoute>
                  <AdminSliders />
                </AdminRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route
              path="/loyalty-settings"
              element={
                <AdminRoute>
                  <LoyaltySettings />
                </AdminRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />
            <Route
              path="/referral-tracking"
              element={
                <AdminRoute>
                  <ReferralTracking />
                </AdminRoute>
              }
            />
          </Routes>
        }
      />

      {/* Public Routes - With Navbar/Footer */}
      <Route
        path="/*"
        element={
          <div className="flex flex-col min-h-screen">
            <Navbar onCartOpen={() => setIsCartSidebarOpen(true)} />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/refer-friend" element={<ReferFriend />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/admin-login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutSteps />} />
                <Route path="/payment-failure" element={<PaymentFailure />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <PrivateRoute>
                      <OrderDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <PrivateRoute>
                      <Wallet />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />

            {/* Cart Sidebar */}
            <CartSidebar
              isOpen={isCartSidebarOpen}
              onClose={() => setIsCartSidebarOpen(false)}
            />
          </div>
        }
      />
    </Routes>
  );
}

export default AppContent;
