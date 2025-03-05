import nodemailer from 'nodemailer';
import logger from '../utils/logger';

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    // Log email attempt
    logger.info('Attempting to send email to:', to);
    logger.info('Email config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
    });

    // Log email content for debugging
    logger.info('Email content:', {
        to,
        subject,
        text,
        html
    });

    // For development, use a test account if SMTP credentials aren't provided
    let transporter;
    let testAccount;
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.info('No SMTP credentials found, using test account');
        // Create a test account on ethereal.email
        testAccount = await nodemailer.createTestAccount();
        
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } else {
        // Use provided SMTP credentials
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Question Bank" <noreply@questionbank.com>',
            to,
            subject,
            text,
            html: html || text
        });
        
        logger.info('Email sent:', info.messageId);
        
        // If using test account, return the preview URL
        if (testAccount) {
            const testEmailUrl = nodemailer.getTestMessageUrl(info);
            logger.info('Preview URL:', testEmailUrl);
            return { 
                messageId: info.messageId,
                testEmailUrl
            };
        }
        
        return { messageId: info.messageId };
    } catch (error) {
        logger.error('Email error:', error);
        throw error;
    }
} 