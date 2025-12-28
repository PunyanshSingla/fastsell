import * as React from 'react';

interface OrderItem {
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant?: string;
}

interface EmailTemplateProps {
    firstName: string;
    orderId?: string;
    orderDate?: string;
    items?: OrderItem[];
    subtotal?: number;
    redirectId?: string;
    shippingCost?: number;
    totalAmount?: number;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
}
const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME;
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
const webdomain = process.env.NEXT_PUBLIC_WEB_DOMAIN;
export default function EmailTemplate({
    firstName,
    orderId,
    items,
    subtotal,
    redirectId,
    shippingCost,
    totalAmount,
    shippingAddress
}: EmailTemplateProps) {
    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            backgroundColor: '#f3f4f6',
            padding: '48px 16px',
            color: '#333333',
            lineHeight: '1.6',
            minHeight: '100vh',
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                margin: '0 auto',
                maxWidth: '640px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                    padding: '48px 40px',
                    textAlign: 'center',
                }}>
                    {/* Placeholder Logo Text */}
                    <h2 style={{
                        color: '#ffffff',
                        margin: '0',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        letterSpacing: '-0.5px'
                    }}>
                        {domainName}
                    </h2>
                </div>

                {/* Hero Section */}
                <div style={{ padding: '48px 40px 32px 40px', textAlign: 'center' }}>
                    <table
                        role="presentation"
                        cellPadding="0"
                        cellSpacing="0"
                        align="center"
                        style={{ marginBottom: '32px' }}
                    >
                        <tr>
                            <td
                                align="center"
                                valign="middle"
                                style={{
                                    width: '88px',
                                    height: '88px',
                                    backgroundColor: '#d1fae5',
                                    borderRadius: '50%',
                                    color: '#059669',
                                    fontSize: '40px',
                                    fontWeight: 'bold',
                                    lineHeight: '88px',
                                    textAlign: 'center',
                                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
                                }}
                            >
                                ✓
                            </td>
                        </tr>
                    </table>

                    <h1 style={{
                        margin: '0 0 20px 0',
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#111827',
                        letterSpacing: '-0.75px',
                        lineHeight: '1.2'
                    }}>
                        Order Confirmed!
                    </h1>
                    <p style={{
                        margin: '0',
                        fontSize: '17px',
                        color: '#6b7280',
                        lineHeight: '1.7',
                        maxWidth: '480px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        Hi {firstName}, thanks for your purchase. We're getting your order ready to be shipped. We will notify you when it has been sent.
                    </p>
                </div>

                {/* Order Details */}
                <div style={{ padding: '24px 40px 32px 40px' }}>
                    <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '16px',
                        padding: '32px 32px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ marginBottom: '32px', borderBottom: '2px solid #e5e7eb', paddingBottom: '24px' }}>
                            <p style={{ margin: '0 0 6px 0', color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 'bold' }}>Order Number</p>
                            <p style={{ margin: '0', color: '#111827', fontSize: '20px', fontWeight: '700' }}>#{orderId}</p>
                        </div>

                        {/* Items */}
                        <div style={{ marginBottom: '32px' }}>
                            {items?.map((item, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '24px',
                                    paddingBottom: index !== items.length - 1 ? '24px' : '0',
                                    borderBottom: index !== items.length - 1 ? '1px solid #e5e7eb' : 'none'
                                }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            objectFit: 'cover',
                                            marginRight: '16px',
                                            backgroundColor: '#e5e7eb',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: '1.4' }}>{item.name}</p>
                                        {item.variant && (
                                            <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>{item.variant}</p>
                                        )}
                                        <p style={{ margin: '0', fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                                        <p style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap' }}>₹{item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                            <tr>
                                <td
                                    align="left"
                                    style={{
                                        fontSize: '15px',
                                        color: '#6b7280',
                                        paddingBottom: '12px'
                                    }}
                                >
                                    Subtotal
                                </td>
                                <td
                                    align="right"
                                    style={{
                                        fontSize: '15px',
                                        color: '#374151',
                                        fontWeight: '600',
                                        paddingBottom: '12px'
                                    }}
                                >
                                    {subtotal?.toFixed(2)}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    align="left"
                                    style={{
                                        fontSize: '15px',
                                        color: '#6b7280'
                                    }}
                                >
                                    Shipping
                                </td>
                                <td
                                    align="right"
                                    style={{
                                        fontSize: '15px',
                                        color: '#059669',
                                        fontWeight: '600'
                                    }}
                                >
                                    {shippingCost === 0 ? 'Free' : `₹${shippingCost?.toFixed(2)}`}
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>

                {/* Customer Address */}
                <div style={{ padding: '0 40px 32px 40px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: '700', color: '#111827', letterSpacing: '-0.25px' }}>Shipping Details</h3>
                    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <p style={{ margin: '0', lineHeight: '1.8', color: '#4b5563', fontSize: '15px' }}>
                            {firstName && (
                                <span
                                    style={{
                                        fontWeight: '600',
                                        color: '#111827',
                                        display: 'block',
                                        marginBottom: '4px',
                                    }}
                                >
                                    {firstName}
                                </span>
                            )}

                            {shippingAddress?.street && (
                                <>
                                    {shippingAddress.street}
                                    <br />
                                </>
                            )}

                            {(shippingAddress?.city || shippingAddress?.state || shippingAddress?.zip) && (
                                <>
                                    {[shippingAddress?.city, shippingAddress?.state, shippingAddress?.zip]
                                        .filter(Boolean)
                                        .join(', ')}
                                    <br />
                                </>
                            )}

                            {shippingAddress?.country && shippingAddress.country}
                        </p>

                    </div>
                </div>

                {/* Call to Action */}
                <div style={{ padding: '0 40px 48px 40px', textAlign: 'center' }}>
                    <a href={`${webdomain}/orders/${redirectId}`} style={{
                        display: 'inline-block',
                        backgroundColor: '#111827',
                        color: '#ffffff',
                        padding: '18px 40px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                        letterSpacing: '-0.25px'
                    }}>
                        View Your Order
                    </a>
                </div>

                {/* Footer */}
                <div style={{ backgroundColor: '#f9fafb', padding: '48px 40px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.7' }}>
                        If you have any questions, reply to this email or contact our support team at <a href={`mailto:${supportEmail}`} style={{ color: '#111827', textDecoration: 'underline', fontWeight: '500' }}>{supportEmail}</a>.
                    </p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>
                        © {new Date().getFullYear()} {domainName}. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Invisible Preheader */}
            <div style={{ display: 'none', fontSize: '1px', color: '#fefefe', lineHeight: '1px', maxHeight: '0px', maxWidth: '0px', opacity: 0, overflow: 'hidden' }}>
                Thank you for your order! We are preparing it for shipment.
            </div>
        </div>
    );
}