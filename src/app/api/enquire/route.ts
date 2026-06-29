import { NextRequest, NextResponse } from 'next/server';

interface EnquiryData {
  propertyType: 'residential' | 'commercial';
  contact: {
    fullName: string;
    email: string;
    phone: string;
  };
  productSlug?: string;
  residential?: {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    preferredInstallDate?: string;
    specialRequirements?: string;
  };
  commercial?: {
    companyName: string;
    contactPerson: string;
    propertyAddress: string;
    suburb: string;
    city: string;
    numberOfUnits: number;
    floorArea: number;
    propertyType: 'office' | 'retail' | 'hotel' | 'warehouse' | 'other';
    preferredStartDate?: string;
    specialRequirements?: string;
  };
  products?: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  installationRequired?: boolean;
  installationAddons?: string[];
  message?: string;
  promoCode?: string;
}

// Generate reference number
function generateReferenceNumber(): string {
  return `ENQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
}

// Format WhatsApp message
function formatWhatsAppMessage(data: EnquiryData, referenceNumber: string): string {
  const { contact, propertyType, productSlug, installationRequired, installationAddons, message } = data;
  
  let msg = `*New Enquiry - ${referenceNumber}*\n\n`;
  msg += `*Contact Details*\n`;
  msg += `Name: ${contact.fullName}\n`;
  msg += `Email: ${contact.email}\n`;
  msg += `Phone: ${contact.phone}\n\n`;
  
  msg += `*Property Type: ${propertyType.toUpperCase()}*\n\n`;
  
  if (propertyType === 'residential' && data.residential) {
    msg += `*Address*\n`;
    msg += `${data.residential.streetAddress}\n`;
    msg += `${data.residential.suburb}, ${data.residential.city}\n`;
    msg += `${data.residential.province}\n\n`;
    if (data.residential.preferredInstallDate) {
      msg += `Preferred Install Date: ${data.residential.preferredInstallDate}\n\n`;
    }
  } else if (propertyType === 'commercial' && data.commercial) {
    msg += `*Company: ${data.commercial.companyName}*\n`;
    msg += `Contact: ${data.commercial.contactPerson}\n\n`;
    msg += `*Address*\n`;
    msg += `${data.commercial.propertyAddress}\n`;
    msg += `${data.commercial.suburb}, ${data.commercial.city}\n\n`;
    msg += `*Property Details*\n`;
    msg += `Units: ${data.commercial.numberOfUnits}\n`;
    msg += `Floor Area: ${data.commercial.floorArea}m²\n`;
    msg += `Type: ${data.commercial.propertyType}\n\n`;
    if (data.commercial.preferredStartDate) {
      msg += `Preferred Start Date: ${data.commercial.preferredStartDate}\n\n`;
    }
  }
  
  if (productSlug) {
    msg += `*Product of Interest: ${productSlug}*\n\n`;
  }
  
  if (data.products && data.products.length > 0) {
    msg += `*Quote Items (${data.products.length})*\n`;
    data.products.forEach((p, i) => {
      msg += `${i + 1}. Product ID: ${p.product_id} x${p.quantity} - R${p.price}\n`;
    });
    msg += '\n';
  }
  
  if (installationRequired !== undefined) {
    msg += `*Installation Required: ${installationRequired ? 'Yes' : 'No'}*\n`;
    if (installationRequired && installationAddons && installationAddons.length > 0) {
      msg += `Add-ons: ${installationAddons.join(', ')}\n`;
    }
    msg += '\n';
  }
  
  if (message) {
    msg += `*Message*\n${message}\n\n`;
  }
  
  if (data.promoCode) {
    msg += `*Promo Code: ${data.promoCode}*\n`;
  }
  
  return msg;
}

// Send WhatsApp message via CallMeBot
async function sendWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    // CallMeBot API - requires API key from https://www.callmebot.com
    // This is a placeholder - user needs to configure their API key
    const callmebotPhone = process.env.CALLMEBOT_PHONE;
    const callmebotApiKey = process.env.CALLMEBOT_API_KEY;

    if (!callmebotPhone || !callmebotApiKey) {
      console.warn('CallMeBot credentials not configured - skipping WhatsApp');
      return { success: false, error: 'CallMeBot credentials not configured' };
    }

    const url = `https://api.callmebot.com/whatsapp.php?phone=${callmebotPhone}&text=${encodeURIComponent(message)}&apikey=${callmebotApiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: 'CallMeBot API request failed' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
}

// Send confirmation email via Resend
async function sendConfirmationEmail(email: string, referenceNumber: string, data: EnquiryData): Promise<{ success: boolean; error?: string }> {
  try {
    // Resend API - requires API key from https://resend.com
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn('Resend API key not configured - skipping email');
      return { success: false, error: 'Resend API key not configured' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Aircons Store <info@airconsstore.co.za>',
        to: email,
        subject: `Quote Request Received - ${referenceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E3A5F;">Quote Request Received</h2>
            <p>Thank you for your enquiry, ${data.contact.fullName}!</p>
            <p><strong>Reference Number:</strong> ${referenceNumber}</p>
            <p>We will contact you within 2 hours via WhatsApp and email to discuss your requirements.</p>
            <hr style="margin: 20px 0;">
            <h3 style="color: #1C99D6;">Enquiry Details</h3>
            <p><strong>Property Type:</strong> ${data.propertyType}</p>
            ${data.productSlug ? `<p><strong>Product:</strong> ${data.productSlug}</p>` : ''}
            ${data.installationRequired !== undefined ? `<p><strong>Installation Required:</strong> ${data.installationRequired ? 'Yes' : 'No'}</p>` : ''}
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Resend API request failed' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: EnquiryData = await request.json();

    // Validate required fields
    if (!data.contact?.fullName || !data.contact?.email || !data.contact?.phone) {
      return NextResponse.json(
        { error: 'Missing required contact fields' },
        { status: 400 }
      );
    }

    // Generate reference number
    const referenceNumber = generateReferenceNumber();

    // Format WhatsApp message
    const whatsappMessage = formatWhatsAppMessage(data, referenceNumber);

    // Send WhatsApp message
    const whatsappResult = await sendWhatsAppMessage(data.contact.phone, whatsappMessage);

    // Send confirmation email
    const emailResult = await sendConfirmationEmail(data.contact.email, referenceNumber, data);

    // Log enquiry for reference
    console.log(`[ENQUIRY] ${referenceNumber} - ${data.contact.fullName} (${data.contact.email})`);
    console.log(`[INTEGRATIONS] WhatsApp: ${whatsappResult.success ? 'OK' : 'FAILED'}, Email: ${emailResult.success ? 'OK' : 'FAILED'}`);

    // Build warnings for failed integrations
    const warnings: string[] = [];
    if (!whatsappResult.success) {
      warnings.push(`WhatsApp notification failed: ${whatsappResult.error}`);
    }
    if (!emailResult.success) {
      warnings.push(`Confirmation email failed: ${emailResult.error}`);
    }

    return NextResponse.json({
      success: true,
      referenceNumber,
      message: 'Enquiry submitted successfully',
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error('Error processing enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to process enquiry' },
      { status: 500 }
    );
  }
}
