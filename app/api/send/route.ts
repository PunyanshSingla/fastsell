import EmailTemplate from '@/components/emails/order-comfirmation';
import { NextRequest } from 'next/server';
import { Resend } from 'resend';
if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not defined");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const body = await req.json();

    try {
        const { data, error } = await resend.emails.send({
            from: `${process.env.NEXT_PUBLIC_DOMAIN_NAME} <${process.env.NEXT_PUBLIC_DOMAIN_NAME}@${process.env.NEXT_PUBLIC_WEB_DOMAIN}>`,
            to: [body.email],
            subject: 'Order Confirmation',
            react: EmailTemplate({
                ...body
            })
        });
        if (error) {
            console.error(error);
            return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}