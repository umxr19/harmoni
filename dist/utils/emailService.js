"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ to, subject, text, html }) {
        // Log email attempt
        logger_1.default.info('Attempting to send email to:', to);
        logger_1.default.info('Email config:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
            user: process.env.SMTP_USER,
            from: process.env.SMTP_FROM
        });
        // Log email content for debugging
        logger_1.default.info('Email content:', {
            to,
            subject,
            text,
            html
        });
        // For development, use a test account if SMTP credentials aren't provided
        let transporter;
        let testAccount;
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            logger_1.default.info('No SMTP credentials found, using test account');
            // Create a test account on ethereal.email
            testAccount = yield nodemailer_1.default.createTestAccount();
            transporter = nodemailer_1.default.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }
        else {
            // Use provided SMTP credentials
            transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        }
        try {
            const info = yield transporter.sendMail({
                from: process.env.SMTP_FROM || '"Question Bank" <noreply@questionbank.com>',
                to,
                subject,
                text,
                html: html || text
            });
            logger_1.default.info('Email sent:', info.messageId);
            // If using test account, return the preview URL
            if (testAccount) {
                const testEmailUrl = nodemailer_1.default.getTestMessageUrl(info);
                logger_1.default.info('Preview URL:', testEmailUrl);
                return {
                    messageId: info.messageId,
                    testEmailUrl
                };
            }
            return { messageId: info.messageId };
        }
        catch (error) {
            logger_1.default.error('Email error:', error);
            throw error;
        }
    });
}
