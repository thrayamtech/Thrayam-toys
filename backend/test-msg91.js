/**
 * MSG91 WhatsApp OTP Test Script
 * This script tests the MSG91 WhatsApp API integration
 */

require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testMSG91WhatsApp() {
  const phone = '8973117229'; // Your test number
  const otp = '1234'; // Test OTP

  console.log('='.repeat(60));
  console.log('MSG91 WhatsApp OTP Test');
  console.log('='.repeat(60));
  console.log('\nConfiguration:');
  console.log('- Phone Number:', phone);
  console.log('- OTP:', otp);
  console.log('- AUTH_KEY:', process.env.MSG91_AUTH_KEY ? '✓ Set' : '✗ Not Set');
  console.log('- WhatsApp Number:', process.env.MSG91_WHATSAPP_NUMBER);
  console.log('- Template Name:', process.env.MSG91_TEMPLATE_NAME);
  console.log('- Namespace:', process.env.MSG91_NAMESPACE);
  console.log('\n' + '='.repeat(60));

  // Format phone with country code
  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

  console.log('\nFormatted Phone:', formattedPhone);

  // Prepare request
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
                value: otp
              },
              button_1: {
                subtype: 'url',
                type: 'text',
                value: otp
              }
            }
          }
        ]
      }
    }
  };

  console.log('\nRequest Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n' + '='.repeat(60));

  try {
    console.log('\nSending request to MSG91...');

    const response = await fetch(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(payload)
      }
    );

    console.log('\nResponse Status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('\nResponse Body:');
    console.log(responseText);

    try {
      const parsedResponse = JSON.parse(responseText);
      console.log('\nParsed Response:');
      console.log(JSON.stringify(parsedResponse, null, 2));

      if (response.ok) {
        console.log('\n✅ SUCCESS! WhatsApp OTP sent to', formattedPhone);
        console.log('Check your WhatsApp for the message.');
      } else {
        console.log('\n❌ FAILED! MSG91 returned an error.');
        console.log('Error Details:', parsedResponse.message || 'Unknown error');
      }
    } catch (parseError) {
      console.log('\n⚠️  Could not parse response as JSON');
    }

  } catch (error) {
    console.log('\n❌ ERROR occurred:');
    console.error(error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
}

// Run the test
testMSG91WhatsApp();
