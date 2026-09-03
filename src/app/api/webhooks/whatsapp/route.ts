import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppNotification } from '../../../../lib/whatsapp/sendNotification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Inbound Order Notification Trigger
    if (body.action === 'send_order_alert') {
      const result = await sendWhatsAppNotification({
        toPhone: body.phone,
        templateName: 'order_confirmation',
        parameters: {
          clientName: body.clientName,
          referenceId: body.orderNumber,
          amount: body.grandTotal,
          trackingUrl: `https://itservicehub.com/order-success?id=${body.orderNumber}`,
        },
      });

      return NextResponse.json({ success: true, notification: result });
    }

    // 2. Inbound Repair Job Card Update Trigger
    if (body.action === 'send_repair_alert') {
      const result = await sendWhatsAppNotification({
        toPhone: body.phone,
        templateName: 'repair_status_update',
        parameters: {
          clientName: body.clientName,
          referenceId: body.jobCardNo,
          statusText: body.statusText,
          technicianName: body.technicianName || 'Vikram K.',
          amount: body.estimatedCost,
        },
      });

      return NextResponse.json({ success: true, notification: result });
    }

    // 3. Webhook Delivery Status Callback from Twilio/Gallabox
    if (body.MessageSid || body.SmsStatus) {
      console.log(`[WhatsApp Webhook Status] Message ${body.MessageSid}: ${body.SmsStatus}`);
      return NextResponse.json({ status: 'ACKNOWLEDGED' });
    }

    return NextResponse.json({ success: true, message: 'WhatsApp Webhook operational' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Webhook Verification Endpoint (For Meta / Gallabox webhook setup)
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'it_service_hub_token')) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({
    service: 'IT Service Hub WhatsApp Automation API Route',
    status: 'ACTIVE',
    location: 'M45 MIDC Nagapur, Ahilyanagar',
  });
}
