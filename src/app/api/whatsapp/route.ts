import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, clientName, type, orderNumber, amount, jobCardNo, status } = await req.json();

    let messageText = '';

    if (type === 'ORDER_CONFIRMED') {
      messageText = `नमस्कार *${clientName}*, \n\n*IT Service Hub* वर तुमची ऑर्डर स्वीकारली आहे! 🎉\n\n📦 *Order ID:* ${orderNumber}\n💰 *एकूण रक्कम:* ₹${amount}\n⚡ *डिलिव्हरी:* MIDC नागापूर / अहिल्यानगर फास्ट डिस्पॅच.\n\nआपल्या ऑर्डरची पावती आणि ट्रॅकिंग लिंक वेबसाइटवर उपलब्ध आहे.`;
    } else if (type === 'JOB_STATUS_UPDATE') {
      messageText = `नमस्कार *${clientName}*, \n\nतुमच्या डिव्हाइसचे सर्व्हिस स्टेटस अपडेट: 🛠️\n\n🎫 *Job Card:* ${jobCardNo}\n📌 *सध्याची स्थिती:* *${status}*\n\nकाही अडचण असल्यास आमच्याशी +91 8787828888 वर संपर्क साधा.\n- *IT Service Hub, अहिल्यानगर*`;
    }

    // WhatsApp Cloud API / Webhook Integration Call (Interakt / Twilio / Gallabox)
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (apiKey) {
      await fetch(`https://api.interakt.ai/v1/public/message/`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode: '+91',
          phoneNumber: phone,
          type: 'Template',
          data: { message: messageText },
        }),
      });
    }

    return NextResponse.json({ success: true, message: 'WhatsApp notification triggered', previewText: messageText });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
