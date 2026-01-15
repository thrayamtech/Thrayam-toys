import React from 'react';
import { FaAward, FaShippingFast, FaLock, FaPhone } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      {/* Hero Section  */}
      <div className="bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] text-white py-20">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">About Thrayam Threads</h1>
          <p className="text-2xl text-pink-100 font-light italic mb-4">
            Threads that tell your story
          </p>
          <p className="text-lg text-pink-200 max-w-3xl mx-auto">
            Where every thread weaves a narrative of tradition, elegance, and your unique journey
          </p>
        </div>
      </div>

      {/* Our Story Section with Line Art */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-[#5A0F1B] mb-6">
                Our Story
              </h2>
              <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
                <p>
                  At <span className="font-bold text-[#5A0F1B]">Thrayam Threads</span>,
                  we believe that every saree is more than just fabric – it's a canvas where stories unfold,
                  memories are woven, and traditions come alive. Each thread carries the essence of
                  craftsmanship, the whispers of heritage, and the promise of timeless beauty.
                </p>
                <p>
                  Our name, <span className="font-semibold">Thrayam</span>, symbolizes the sacred trinity
                  of creation, preservation, and transformation. Just as life flows through these eternal
                  cycles, we curate sarees that honor the past, celebrate the present, and inspire the future.
                </p>
                <p>
                  We are storytellers through textiles, connecting you with the artisans whose hands breathe
                  life into every weave, every motif, every color. When you drape a saree from Thrayam Threads,
                  you're not just wearing a garment – you're embracing a narrative, carrying forward a legacy,
                  and telling <span className="italic font-medium">your</span> story.
                </p>
              </div>
            </div>

            {/* Decorative Line Art */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full h-96">
                {/* Abstract Thread Pattern */}
                <svg viewBox="0 0 400 400" className="w-full h-full opacity-80">
                  {/* Flowing threads */}
                  <path
                    d="M 50 200 Q 100 100, 200 150 T 350 200"
                    stroke="#5A0F1B"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                  <path
                    d="M 50 220 Q 120 280, 200 240 T 350 220"
                    stroke="#8A1F35"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 50 180 Q 80 120, 200 160 T 350 180"
                    stroke="#5A0F1B"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.6"
                  />

                  {/* Decorative dots representing fabric weave */}
                  <circle cx="100" cy="150" r="4" fill="#5A0F1B" opacity="0.7" />
                  <circle cx="200" cy="180" r="5" fill="#8A1F35" />
                  <circle cx="300" cy="200" r="4" fill="#5A0F1B" opacity="0.7" />
                  <circle cx="150" cy="240" r="3" fill="#8A1F35" opacity="0.6" />
                  <circle cx="250" cy="220" r="4" fill="#5A0F1B" />

                  {/* Flowing saree drape outline */}
                  <path
                    d="M 150 100 Q 180 120, 200 100 Q 220 80, 250 100 L 250 300 Q 220 320, 200 300 Q 180 280, 150 300 Z"
                    stroke="#5A0F1B"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.4"
                  />

                  {/* Traditional motifs */}
                  <circle cx="200" cy="200" r="60" stroke="#8A1F35" strokeWidth="1" fill="none" opacity="0.3" />
                  <circle cx="200" cy="200" r="50" stroke="#5A0F1B" strokeWidth="1" fill="none" opacity="0.3" />
                </svg>

                {/* Floating text elements */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-6xl font-serif text-[#5A0F1B] opacity-10">
                    ✦
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className="py-20 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Decorative Line Art - Thread Weaving */}
            <div className="relative flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full h-96">
                <svg viewBox="0 0 400 400" className="w-full h-full opacity-70">
                  {/* Loom-inspired pattern */}
                  <line x1="50" y1="50" x2="50" y2="350" stroke="#5A0F1B" strokeWidth="1" opacity="0.4" />
                  <line x1="100" y1="50" x2="100" y2="350" stroke="#5A0F1B" strokeWidth="1" opacity="0.4" />
                  <line x1="150" y1="50" x2="150" y2="350" stroke="#8A1F35" strokeWidth="1.5" opacity="0.5" />
                  <line x1="200" y1="50" x2="200" y2="350" stroke="#5A0F1B" strokeWidth="2" opacity="0.6" />
                  <line x1="250" y1="50" x2="250" y2="350" stroke="#8A1F35" strokeWidth="1.5" opacity="0.5" />
                  <line x1="300" y1="50" x2="300" y2="350" stroke="#5A0F1B" strokeWidth="1" opacity="0.4" />
                  <line x1="350" y1="50" x2="350" y2="350" stroke="#5A0F1B" strokeWidth="1" opacity="0.4" />

                  {/* Horizontal weave */}
                  <path d="M 50 100 Q 200 120, 350 100" stroke="#8A1F35" strokeWidth="2" fill="none" opacity="0.5" />
                  <path d="M 50 150 Q 200 130, 350 150" stroke="#5A0F1B" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M 50 200 Q 200 220, 350 200" stroke="#8A1F35" strokeWidth="2" fill="none" opacity="0.5" />
                  <path d="M 50 250 Q 200 230, 350 250" stroke="#5A0F1B" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M 50 300 Q 200 320, 350 300" stroke="#8A1F35" strokeWidth="2" fill="none" opacity="0.5" />

                  {/* Central medallion */}
                  <circle cx="200" cy="200" r="40" stroke="#5A0F1B" strokeWidth="2" fill="none" />
                  <circle cx="200" cy="200" r="30" stroke="#8A1F35" strokeWidth="1" fill="none" opacity="0.6" />
                  <text x="200" y="210" textAnchor="middle" fill="#5A0F1B" fontSize="20" fontWeight="bold" fontFamily="serif">TT</text>
                </svg>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-serif font-bold text-[#5A0F1B] mb-6">
                Our Philosophy
              </h2>
              <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
                <p>
                  Every woman has a story – of dreams pursued, battles won, love cherished, and moments
                  celebrated. At Thrayam Threads, we honor these narratives by offering sarees that resonate
                  with your journey.
                </p>
                <div className="space-y-4 ml-4 border-l-4 border-[#5A0F1B] pl-6">
                  <div>
                    <h3 className="font-bold text-[#5A0F1B] mb-2">Authenticity</h3>
                    <p className="text-gray-600">
                      We source directly from master weavers, ensuring each piece carries the soul of traditional craftsmanship.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#5A0F1B] mb-2">Heritage</h3>
                    <p className="text-gray-600">
                      From ancient weaving techniques to timeless designs, we preserve the legacy of Indian textiles.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#5A0F1B] mb-2">Your Story</h3>
                    <p className="text-gray-600">
                      Whether it's your first saree or your hundredth, we believe each drape should feel like a chapter in your story.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#5A0F1B] mb-4">
              Why Choose Thrayam Threads
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We weave trust, quality, and care into every interaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-b from-pink-50 to-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-[#5A0F1B] to-[#8A1F35] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaAward className="text-4xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#5A0F1B] mb-3">Authentic Craftsmanship</h3>
              <p className="text-gray-600">
                Every saree is sourced directly from skilled artisans, ensuring authenticity and preserving traditional weaving arts.
              </p>
            </div>

            <div className="bg-gradient-to-b from-pink-50 to-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-[#5A0F1B] to-[#8A1F35] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaShippingFast className="text-4xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#5A0F1B] mb-3">Swift & Secure Delivery</h3>
              <p className="text-gray-600">
                Your treasured saree reaches you safely and swiftly. Free delivery on orders above ₹999.
              </p>
            </div>

            <div className="bg-gradient-to-b from-pink-50 to-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-[#5A0F1B] to-[#8A1F35] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaLock className="text-4xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#5A0F1B] mb-3">Secure Shopping</h3>
              <p className="text-gray-600">
                Shop with confidence using our secure payment gateway. Your trust is our priority.
              </p>
            </div>

            <div className="bg-gradient-to-b from-pink-50 to-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-[#5A0F1B] to-[#8A1F35] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaPhone className="text-4xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#5A0F1B] mb-3">Dedicated Support</h3>
              <p className="text-gray-600">
                Our team is here to guide you through your journey, ensuring every experience is memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Thrayam Promise */}
      <section className="py-20 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="relative">
            {/* Decorative border */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent"></div>

            <div className="pt-8">
              <h2 className="text-4xl font-serif font-bold text-[#5A0F1B] mb-8">
                The Thrayam Promise
              </h2>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl italic text-[#5A0F1B] font-serif">
                  "When you choose Thrayam Threads, you're not just purchasing a saree –
                  you're becoming part of a legacy."
                </p>

                <p>
                  We promise to bring you sarees that are as unique as your story. Each piece in our
                  collection is carefully curated to ensure it meets our exacting standards of quality,
                  authenticity, and beauty.
                </p>

                <p>
                  From the first thread to the final drape, from the artisan's loom to your wardrobe,
                  we ensure that every step honors the sacred craft of weaving and celebrates you –
                  the woman who brings these threads to life.
                </p>
              </div>
            </div>

            {/* Decorative bottom border */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#5A0F1B] to-transparent mt-8"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#5A0F1B] to-[#8A1F35] text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 400">
            <path d="M 0 200 Q 200 100, 400 200 T 800 200" stroke="white" strokeWidth="2" fill="none" />
            <path d="M 0 220 Q 200 320, 400 220 T 800 220" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Begin Your Story With Us
          </h2>
          <p className="text-xl text-pink-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection and find the saree that speaks to your soul
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-[#5A0F1B] px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
          >
            Discover Our Collection
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
