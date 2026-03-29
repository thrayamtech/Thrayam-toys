import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

const C = {
  skin:      '#F7EFE5',
  skinLight: '#FDFAF6',
  skinMid:   '#EDD8C0',
  skinBorder:'#DFC09A',
  wood:      '#6B4226',
  dark:      '#2F1E14',
  sage:      '#8FAF9D',
  sageMid:   '#D6E8DE',
  sageDark:  '#4F7A65',
  gold:      '#DDBB72',
  goldMid:   '#F4EAC8',
  terra:     '#C96A4A',
  terraMid:  '#F5D8CC',
};

const inputStyle = {
  width: '100%',
  padding: '10px 16px',
  border: `1.5px solid ${C.skinMid}`,
  borderRadius: 12,
  background: C.skinLight,
  color: C.dark,
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.875rem',
  outline: 'none',
};

const CONTACT_CARDS = [
  {
    icon: <FaPhone />,
    title: 'Call Us',
    sub: 'Mon–Sat, 10 AM – 7 PM',
    value: '+91 88072 59471',
    href: 'tel:+918807259471',
    bg: C.goldMid, color: C.wood,
  },
  {
    icon: <FaEnvelope />,
    title: 'Email Us',
    sub: 'Reply within 24 hours',
    value: 'info@thrayamtoys.com',
    href: 'mailto:info@thrayamtoys.com',
    bg: C.sageMid, color: C.sageDark,
  },
  {
    icon: <FaWhatsapp />,
    title: 'WhatsApp',
    sub: 'Chat with us instantly',
    value: 'Start a Chat',
    href: 'https://wa.me/918807259471',
    bg: '#DCFCE7', color: '#15803D',
    external: true,
  },
];

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const fieldStyle = name => ({
    ...inputStyle,
    borderColor: focused === name ? C.gold : C.skinMid,
    boxShadow: focused === name ? `0 0 0 3px ${C.gold}30` : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  return (
    <div className="min-h-screen" style={{ background: C.skin }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-16 md:py-22" style={{ background: C.dark }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: C.wood, opacity: 0.28 }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: C.sage, opacity: 0.1 }} />
        <div className="container-custom relative text-center py-4">
          <span className="inline-block font-sans text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
            style={{ background: `${C.gold}20`, color: C.gold, border: `1px solid ${C.gold}40` }}>
            Contact Us
          </span>
          <h1 className="font-serif mb-4" style={{ color: C.skin, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            We'd Love to Hear from You
          </h1>
          <p className="font-sans text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: `${C.skinMid}CC` }}>
            Have a question about an order, a product, or just want to say hi? We're here to help.
          </p>
        </div>
      </section>

      <div className="container-custom py-12">

        {/* ── Contact cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {CONTACT_CARDS.map(({ icon, title, sub, value, href, bg, color, external }) => (
            <a key={title} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group"
              style={{ background: '#fff', border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 14px rgba(47,30,20,0.07)' }}>
              <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-lg transition-transform duration-300 group-hover:scale-110"
                style={{ background: bg, color }}>
                {icon}
              </div>
              <h3 className="font-serif mb-1" style={{ color: C.dark, fontSize: '1.05rem' }}>{title}</h3>
              <p className="font-sans text-xs mb-2" style={{ color: C.wood }}>{sub}</p>
              <span className="font-sans font-semibold text-sm" style={{ color }}>{value}</span>
            </a>
          ))}
        </div>

        {/* ── Form + Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form — wider */}
          <div className="lg:col-span-3 rounded-2xl p-7 md:p-8"
            style={{ background: '#fff', border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 16px rgba(47,30,20,0.07)' }}>
            <h2 className="font-serif mb-1" style={{ color: C.dark, fontSize: '1.4rem' }}>Send Us a Message</h2>
            <p className="font-sans text-sm mb-6" style={{ color: C.wood }}>
              Fill out the form and we'll respond as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block font-sans text-xs font-semibold mb-1.5" style={{ color: C.dark }}>
                  Your Name *
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="Enter your name"
                  style={fieldStyle('name')}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold mb-1.5" style={{ color: C.dark }}>
                    Email Address *
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="your@email.com"
                    style={fieldStyle('email')}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold mb-1.5" style={{ color: C.dark }}>
                    Phone Number
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    style={fieldStyle('phone')}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-sans text-xs font-semibold mb-1.5" style={{ color: C.dark }}>
                  Subject *
                </label>
                <select name="subject" value={formData.subject} onChange={handleChange} required
                  style={fieldStyle('subject')}
                  onFocus={() => setFocused('subject')} onBlur={() => setFocused('')}>
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-status">Order Status</option>
                  <option value="return-exchange">Return / Exchange</option>
                  <option value="bulk-order">Bulk / Gift Order</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block font-sans text-xs font-semibold mb-1.5" style={{ color: C.dark }}>
                  Your Message *
                </label>
                <textarea name="message" value={formData.message} onChange={handleChange} required
                  rows={5} placeholder="How can we help you?"
                  style={{ ...fieldStyle('message'), resize: 'none' }}
                  onFocus={() => setFocused('message')} onBlur={() => setFocused('')} />
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-sans font-bold text-sm transition-all duration-200 disabled:opacity-60"
                style={{ background: C.terra, color: '#fff', boxShadow: '0 4px 16px rgba(201,106,74,0.3)' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-xs" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Address */}
            <div className="rounded-2xl p-6"
              style={{ background: '#fff', border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 14px rgba(47,30,20,0.06)' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: C.terraMid, color: C.terra }}>
                  <FaMapMarkerAlt className="text-sm" />
                </div>
                <div>
                  <h3 className="font-serif mb-2" style={{ color: C.dark, fontSize: '1.05rem' }}>Our Location</h3>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: C.wood }}>
                    11/109/2, Edavattam,<br />
                    Thirunanthikarai, Kulasekharam,<br />
                    Kanyakumari Dist — 629161,<br />
                    Tamil Nadu, India
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl overflow-hidden" style={{ height: 180 }}>
                <iframe
                  title="Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886539092!2d77.49085284335113!3d12.953945614058336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>

            {/* Business hours */}
            <div className="rounded-2xl p-6"
              style={{ background: '#fff', border: `1.5px solid ${C.skinMid}`, boxShadow: '0 2px 14px rgba(47,30,20,0.06)' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: C.goldMid, color: C.wood }}>
                  <FaClock className="text-sm" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif mb-3" style={{ color: C.dark, fontSize: '1.05rem' }}>Business Hours</h3>
                  <div className="space-y-2">
                    {[
                      { day: 'Monday – Friday', time: '10:00 AM – 7:00 PM' },
                      { day: 'Saturday',        time: '10:00 AM – 6:00 PM' },
                      { day: 'Sunday',          time: 'Closed', closed: true },
                    ].map(({ day, time, closed }) => (
                      <div key={day} className="flex justify-between items-center py-1.5"
                        style={{ borderBottom: `1px solid ${C.skinMid}` }}>
                        <span className="font-sans text-xs font-semibold" style={{ color: C.dark }}>{day}</span>
                        <span className="font-sans text-xs" style={{ color: closed ? C.terra : C.wood }}>{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/918807259471" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 group"
              style={{ background: C.dark, border: `1.5px solid ${C.gold}30` }}
              onMouseEnter={e => e.currentTarget.style.background = C.wood}
              onMouseLeave={e => e.currentTarget.style.background = C.dark}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: '#25D36625', color: '#25D366' }}>
                <FaWhatsapp />
              </div>
              <div>
                <p className="font-sans font-bold text-sm leading-tight mb-0.5" style={{ color: C.skin }}>
                  Need a quick answer?
                </p>
                <p className="font-sans text-xs" style={{ color: `${C.skinMid}AA` }}>
                  Chat with us on WhatsApp — we reply fast!
                </p>
              </div>
            </a>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
