import axios from 'axios';

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Send an OTP via WhatsApp Cloud API.
 * 
 * @param {string} phone - The recipient's phone number in international format (e.g., +923XXXXXXXXX).
 * @param {string} otp - The generated OTP code.
 * @param {'signupotp' | 'forgototp' | 'forgotpassword'} templateName - The WhatsApp template to use.
 * @param {string} contactNumber - The support/contact number (e.g., 1800-555-1234).
 * @param {string} [urlButton] - (Optional) The URL parameter for the button. Defaults to the OTP.
 */
export const sendWhatsAppOTP = async (phone, otp, templateName, contactNumber, urlButton = otp) => {
    try {
        // Build components array. Your template expects two body parameters and one URL button parameter.
        const components = [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: otp },         // OTP value (e.g., {{1}})
                    { type: 'text', text: contactNumber }  // Contact/support number (e.g., {{2}})
                ],
            },
            {
                type: 'button',
                sub_type: 'url',
                index: 0,
                parameters: [
                    { type: 'text', text: urlButton }    // Button parameter (e.g., copy button value)
                ],
            },
        ];

        const response = await axios.post(
            WHATSAPP_API_URL,
            {
                messaging_product: 'whatsapp',
                to: phone,
                type: 'template',
                template: {
                    name: templateName, // e.g., 'signupotp' or 'forgototp'
                    language: { code: 'en_US' },
                    components,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp OTP');
    }
};

export const sendWhatsAppOrderUpdate = async (phone, otp, templateName, contactNumber, urlButton = otp) => {
    try {
        // Build components array. Your template expects two body parameters and one URL button parameter.
        const components = [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: otp },         // OTP value (e.g., {{1}})
                    { type: 'text', text: contactNumber }  // Contact/support number (e.g., {{2}})
                ],
            },
            {
                type: 'button',
                sub_type: 'url',
                index: 0,
                parameters: [
                    { type: 'text', text: urlButton }    // Button parameter (e.g., copy button value)
                ],
            },
        ];

        const response = await axios.post(
            WHATSAPP_API_URL,
            {
                messaging_product: 'whatsapp',
                to: phone,
                type: 'template',
                template: {
                    name: templateName, // e.g., 'signupotp' or 'forgototp'
                    language: { code: 'en_US' },
                    components,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp OTP');
    }
};
