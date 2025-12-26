import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const demoRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Create nodemailer transporter with Neo SMTP
// Debug: Log SMTP config (hide password)
console.log('SMTP Config:', {
  host: process.env.SMTP_HOST || 'smtp0001.neo.space',
  port: process.env.SMTP_PORT || '587',
  user: process.env.SMTP_USER,
  passLength: process.env.SMTP_PASS?.length
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp0001.neo.space',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL/TLS on port 465
  auth: {
    user: process.env.SMTP_USER, // Full email: admin@harakapayment.com
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = demoRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = validation.data;

    // Log the request
    console.log('Demo request received:', {
      name,
      email,
      phone,
      message,
      timestamp: new Date().toISOString()
    });

    // Send email using Neo SMTP
    try {
      await transporter.sendMail({
        from: `"HarakaPay Demo Requests" <${process.env.SMTP_USER}>`,
        to: 'admin@harakapayment.com',
        subject: `Demo Request from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Demo Request</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 10px 0;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            </div>
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Message:</strong></p>
              <p style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">${message}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">Submitted on ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
        `,
        text: `
New Demo Request

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

Submitted on ${new Date().toLocaleString()}
        `.trim()
      });

      console.log('Demo request email sent successfully to admin@harakapayment.com');

      return NextResponse.json({
        success: true,
        message: 'Demo request submitted successfully. We will contact you soon!'
      });

    } catch (emailError) {
      console.error('Failed to send demo request email:', emailError);

      // Still return success to user but log the error
      return NextResponse.json({
        success: true,
        message: 'Demo request received. We will contact you soon!'
      });
    }

  } catch (error) {
    console.error('Demo request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
