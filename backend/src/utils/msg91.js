/**
 * MSG91 WhatsApp OTP Service
 * Sends OTP via WhatsApp using MSG91 API
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Send WhatsApp OTP using MSG91
 * @param {string} phone - Phone number (10 digits without country code)
 * @param {string} otp - 4-6 digit OTP
 * @returns {Promise<Object>} - Response from MSG91
 */
const sendWhatsAppOTP = async (phone, otp) => {
  try {
    // Validate inputs
    if (!phone || !otp) {
      throw new Error('Phone number and OTP are required');
    }

    // Ensure phone has country code (91 for India)
    const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('authkey', process.env.MSG91_AUTH_KEY);

    const payload = {
      integrated_number: process.env.MSG91_WHATSAPP_NUMBER || '918807259471',
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
          name: process.env.MSG91_TEMPLATE_NAME || 'thrayam',
          language: {
            code: 'en',
            policy: 'deterministic'
          },
          namespace: process.env.MSG91_NAMESPACE || 'f94dd3ac_bc4e_4c6e_abd9_1fe9077d8e0e',
          to_and_components: [
            {
              to: [formattedPhone],
              components: {
                body_1: {
                  type: 'text',
                  value: otp // OTP value
                },
                button_1: {
                  subtype: 'url',
                  type: 'text',
                  value: otp // OTP in button if needed
                }
              }
            }
          ]
        }
      }
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: 'follow'
    };

    console.log(`Sending WhatsApp OTP to ${formattedPhone}`);

    const response = await fetch(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      requestOptions
    );

    const result = await response.text();
    const parsedResult = JSON.parse(result);

    console.log('MSG91 Response:', parsedResult);

    if (response.ok) {
      return {
        success: true,
        message: 'WhatsApp OTP sent successfully',
        data: parsedResult
      };
    } else {
      throw new Error(parsedResult.message || 'Failed to send WhatsApp OTP');
    }
  } catch (error) {
    console.error('MSG91 WhatsApp OTP Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send WhatsApp OTP',
      error: error.toString()
    };
  }
};

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default 4)
 * @returns {string} - Generated OTP
 */
const generateOTP = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Store OTP in memory (for production, use Redis or database)
 */
const otpStore = new Map();

/**
 * Save OTP with expiry
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 * @param {number} expiryMinutes - Expiry time in minutes (default 10)
 */
const saveOTP = (phone, otp, expiryMinutes = 10) => {
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
  otpStore.set(phone, {
    otp,
    expiryTime,
    attempts: 0
  });
  console.log(`OTP saved for ${phone}: ${otp} (expires in ${expiryMinutes} min)`);
};

/**
 * Verify OTP
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to verify
 * @returns {Object} - Verification result
 */
const verifyOTP = (phone, otp) => {
  const stored = otpStore.get(phone);

  if (!stored) {
    return {
      success: false,
      message: 'OTP not found or expired. Please request a new one.'
    };
  }

  // Check expiry
  if (Date.now() > stored.expiryTime) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }

  // Check attempts
  if (stored.attempts >= 3) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.'
    };
  }

  // Verify OTP
  if (stored.otp === otp) {
    otpStore.delete(phone);
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } else {
    stored.attempts += 1;
    return {
      success: false,
      message: `Invalid OTP. ${3 - stored.attempts} attempts remaining.`
    };
  }
};

/**
 * Clear OTP
 * @param {string} phone - Phone number
 */
const clearOTP = (phone) => {
  otpStore.delete(phone);
};

/**
 * Send WhatsApp Referral Message
 * @param {string} phone - Friend's phone number (10 digits without country code)
 * @param {string} referrerName - Name of the person referring
 * @param {string} referralLink - Referral link to share
 * @returns {Promise<Object>} - Response from MSG91
 */
const sendWhatsAppReferral = async (phone, referrerName, referralLink) => {
  try {
    // Validate inputs
    if (!phone || !referrerName || !referralLink) {
      throw new Error('Phone number, referrer name, and referral link are required');
    }

    // Ensure phone has country code (91 for India)
    const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('authkey', process.env.MSG91_AUTH_KEY);

    const payload = {
      integrated_number: process.env.MSG91_WHATSAPP_NUMBER || '918807259471',
      content_type: 'template',
      payload: {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
          name: process.env.MSG91_TEMPLATE_REFERAL_NAME || 'thrayam_refer',
          language: {
            code: 'en',
            policy: 'deterministic'
          },
          namespace: process.env.MSG91_NAMESPACE || 'f94dd3ac_bc4e_4c6e_abd9_1fe9077d8e0e',
          to_and_components: [
            {
              to: [formattedPhone],
              components: {
                header_1: {
                  type: 'text',
                  text: referrerName
                },
                button_1: {
                  subtype: 'url',
                  type: 'text',
                  text: referralLink
                }
              }
            }
          ]
        }
      }
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: 'follow'
    };

    console.log(`Sending WhatsApp referral message to ${formattedPhone} from ${referrerName}`);

    const response = await fetch(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      requestOptions
    );

    const result = await response.text();
    const parsedResult = JSON.parse(result);

    console.log('MSG91 Referral Response:', parsedResult);

    if (response.ok) {
      return {
        success: true,
        message: 'WhatsApp referral message sent successfully',
        data: parsedResult
      };
    } else {
      throw new Error(parsedResult.message || 'Failed to send WhatsApp referral message');
    }
  } catch (error) {
    console.error('MSG91 WhatsApp Referral Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send WhatsApp referral message',
      error: error.toString()
    };
  }
};

module.exports = {
  sendWhatsAppOTP,
  sendWhatsAppReferral,
  generateOTP,
  saveOTP,
  verifyOTP,
  clearOTP
};
