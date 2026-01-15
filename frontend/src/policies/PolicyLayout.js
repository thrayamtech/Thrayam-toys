import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShieldAlt, FaFileContract, FaUndo, FaTruck, FaChevronRight, FaHome } from "react-icons/fa";

const PolicyLayout = ({ title, children, icon: Icon }) => {
  const location = useLocation();

  const policies = [
    { path: "/privacy-policy", title: "Privacy Policy", icon: FaShieldAlt },
    { path: "/terms-conditions", title: "Terms & Conditions", icon: FaFileContract },
    { path: "/refund-policy", title: "Refund Policy", icon: FaUndo },
    { path: "/shipping-policy", title: "Shipping Policy", icon: FaTruck },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-white transition flex items-center">
              <FaHome className="mr-1" /> Home
            </Link>
            <FaChevronRight className="mx-2 text-xs" />
            <span className="text-white">{title}</span>
          </nav>

          <div className="text-center">
            {Icon && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                <Icon className="text-3xl" />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3">{title}</h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Please read this policy carefully to understand how we handle your information and orders.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Policy Pages
              </h3>
              <nav className="space-y-2">
                {policies.map((policy) => {
                  const isActive = location.pathname === policy.path;
                  const PolicyIcon = policy.icon;
                  return (
                    <Link
                      key={policy.path}
                      to={policy.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#5A0F1B] to-[#7A1525] text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <PolicyIcon className={`mr-3 ${isActive ? "text-white" : "text-[#5A0F1B]"}`} />
                      <span className="font-medium text-sm">{policy.title}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Contact CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Have questions about our policies?</p>
                <Link
                  to="/contact"
                  className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition text-sm"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 lg:p-10">
              <div className="policy-content prose prose-lg max-w-none">
                {children}
              </div>

              {/* Last Updated */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: January 2025
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {policies
                .filter((p) => p.path !== location.pathname)
                .slice(0, 2)
                .map((policy) => {
                  const PolicyIcon = policy.icon;
                  return (
                    <Link
                      key={policy.path}
                      to={policy.path}
                      className="flex items-center bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition group"
                    >
                      <div className="bg-[#5A0F1B]/10 p-3 rounded-full mr-4 group-hover:bg-[#5A0F1B]/20 transition">
                        <PolicyIcon className="text-xl text-[#5A0F1B]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 group-hover:text-[#5A0F1B] transition">
                          {policy.title}
                        </h4>
                        <p className="text-sm text-gray-500">Read more →</p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </main>
        </div>
      </div>

      {/* Custom Styles for Policy Content */}
      <style>{`
        .policy-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #5A0F1B;
          display: inline-block;
        }
        .policy-content h2:first-child {
          margin-top: 0;
        }
        .policy-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .policy-content p {
          color: #4b5563;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .policy-content ul, .policy-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
          color: #4b5563;
        }
        .policy-content li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }
        .policy-content ul li {
          list-style-type: disc;
        }
        .policy-content ol li {
          list-style-type: decimal;
        }
        .policy-content strong {
          color: #1f2937;
          font-weight: 600;
        }
        .policy-content a {
          color: #5A0F1B;
          text-decoration: underline;
        }
        .policy-content a:hover {
          color: #7A1525;
        }
      `}</style>
    </div>
  );
};

export default PolicyLayout;
