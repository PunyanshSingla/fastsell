import EmailTemplate from "@/components/emails/order-comfirmation";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not defined");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderEmailPayload {
    firstName: string;
    redirectId: string;
    orderId: string;
    orderDate: string;
    items: {
        name: string;
        image: string;
        price: number;
        quantity: number;
        variant?: string;
    }[];
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    email: string;
}

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
    const { email, ...templateProps } = payload;

    const { error } = await resend.emails.send({
        from: `${process.env.NEXT_PUBLIC_DOMAIN_NAME} <no-reply@${process.env.NEXT_PUBLIC_MAIL_DOMAIN}>`,
        to: [email],
        subject: `Order Confirmation • ${payload.orderId}`,
        react: EmailTemplate(templateProps),
    });

    if (error) {
        console.error("❌ Resend error:", error);
        throw new Error("Failed to send order confirmation email");
    }
}
