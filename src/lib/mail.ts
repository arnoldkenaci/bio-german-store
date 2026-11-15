import "server-only";
import nodemailer from "nodemailer";
import { shop } from "./shop";

/**
 * Sends mail through any SMTP mailbox (IONOS, Strato, Google Workspace …).
 * Order confirmations are sent by Stripe (enable "Successful payments" under
 * Settings → Customer emails); this module only sends the shipping notice.
 */
export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

export async function sendShippingMail(params: {
  to: string;
  name: string;
  trackingUrl: string;
  shipmentNo: string;
}): Promise<boolean> {
  if (!mailConfigured()) return false;

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  const firstName = params.name.split(" ")[0] || params.name;
  const text = [
    `Hallo ${firstName},`,
    "",
    "deine Bestellung ist unterwegs! Wir haben dein Paket an DHL übergeben.",
    "",
    `Sendungsnummer: ${params.shipmentNo}`,
    `Sendungsverfolgung: ${params.trackingUrl}`,
    "",
    "Viel Freude mit deinem Kupfer!",
    `Dein ${shop.name} Team`,
  ].join("\n");

  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: params.to,
    replyTo: shop.contactEmail,
    subject: `Deine Bestellung bei ${shop.name} ist unterwegs`,
    text,
  });
  return true;
}
