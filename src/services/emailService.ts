import nodemailer from 'nodemailer';
import Order from '../models/Order';
import Product from '../models/Product';
import Invoice from '../models/Invoice';
import Batch from '../models/Batch';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email configuration
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Dairy Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Dairy Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (
  order: Order,
  clientEmail: string,
  clientName: string
) => {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(item.price || 0).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * Number(item.price || 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Dairy Management System" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmed!</h2>
        <p>Hello ${clientName},</p>
        <p>Thank you for your order. Your order has been confirmed and is being processed.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a;">${order.status}</span></p>
        </div>

        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Quantity</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f3f4f6;">
              <td colspan="3" style="padding: 8px; text-align: right;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px; text-align: right;"><strong>$${Number(order.total || 0).toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <p style="margin-top: 20px;">We'll notify you when your order is out for delivery.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Dairy Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation sent to ${clientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation:', error);
    return false;
  }
};

// Send low stock alert
export const sendLowStockAlert = async (
  products: Product[],
  recipientEmail: string,
  recipientName: string
) => {
  const productsHtml = products.map(product => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${product.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; color: #dc2626;">
        <strong>${Number(product.currentStock || 0).toFixed(2)}</strong>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${Number(product.minThreshold || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Dairy Management System" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: '⚠️ Low Stock Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Low Stock Alert</h2>
        <p>Hello ${recipientName},</p>
        <p>The following products are running low on stock and need to be restocked:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #fee2e2;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Current Stock</th>
              <th style="padding: 8px; text-align: center;">Minimum Stock</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
        </table>

        <p><strong>Action Required:</strong> Please review and restock these products as soon as possible.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Dairy Management System - Automated Alert</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Low stock alert sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending low stock alert:', error);
    return false;
  }
};

// Send expiration warning for batches approaching their shelf life limit
export const sendExpirationWarning = async (
  batches: Array<Batch & { productRef?: Product }>,
  recipientEmail: string,
  recipientName: string
) => {
  const batchesHtml = batches.map(batch => {
    // Calculate expiry date based on start time + product shelf life
    const productShelfLife = (batch.productRef?.shelfLife as any) || 7; // default 7 days
    const expiryDate = new Date(batch.startTime);
    expiryDate.setDate(expiryDate.getDate() + Number(productShelfLife));
    
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${batch.batchNumber}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${batch.productId}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${Number(batch.quantity || 0).toFixed(0)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${expiryDate.toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; color: ${daysUntilExpiry <= 3 ? '#dc2626' : '#f59e0b'};">
          <strong>${daysUntilExpiry} days</strong>
        </td>
      </tr>
    `;
  }).join('');

  const mailOptions = {
    from: `"Dairy Management System" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: '⏰ Product Expiration Warning',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⏰ Product Expiration Warning</h2>
        <p>Hello ${recipientName},</p>
        <p>The following product batches are approaching their expiration date:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #fef3c7;">
              <th style="padding: 8px; text-align: left;">Batch Number</th>
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Quantity</th>
              <th style="padding: 8px; text-align: center;">Expiry Date</th>
              <th style="padding: 8px; text-align: center;">Days Left</th>
            </tr>
          </thead>
          <tbody>
            ${batchesHtml}
          </tbody>
        </table>

        <p><strong>Action Required:</strong> Please prioritize the sale or use of these products to avoid waste.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Dairy Management System - Automated Alert</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Expiration warning sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending expiration warning:', error);
    return false;
  }
};

// Send payment reminder
export const sendPaymentReminder = async (
  invoice: Invoice,
  clientEmail: string,
  clientName: string
) => {
  const daysOverdue = Math.ceil(
    (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const mailOptions = {
    from: `"Dairy Management System" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: `Payment Reminder - Invoice #${invoice.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Reminder</h2>
        <p>Hello ${clientName},</p>
        <p>This is a friendly reminder that the following invoice is ${daysOverdue > 0 ? `<strong style="color: #dc2626;">${daysOverdue} days overdue</strong>` : 'due soon'}.</p>
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>Invoice Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Amount Due:</strong> <span style="font-size: 24px; color: #dc2626;">$${Number(invoice.total || 0).toFixed(2)}</span></p>
        </div>

        <p>Please arrange payment at your earliest convenience to avoid any service interruptions.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p><strong>Payment Methods:</strong></p>
          <p>Bank Transfer • Credit Card • Cash</p>
        </div>

        <p>If you have already made this payment, please disregard this reminder.</p>
        <p>For any questions, please contact our billing department.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Dairy Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment reminder sent to ${clientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    return false;
  }
};

// Send daily production report
export const sendDailyProductionReport = async (
  reportData: {
    date: string;
    totalProduction: number;
    batchesCompleted: number;
    productionByProduct: Array<{ productName: string; quantity: number }>;
    activeOperators: number;
  },
  recipientEmail: string,
  recipientName: string
) => {
  const productionHtml = reportData.productionByProduct.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity.toFixed(0)} units</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Dairy Management System" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `Daily Production Report - ${reportData.date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📊 Daily Production Report</h2>
        <p>Hello ${recipientName},</p>
        <p>Here's your production summary for ${reportData.date}:</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #1e40af; font-size: 12px;">Total Production</p>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold; color: #1e40af;">
              ${reportData.totalProduction.toFixed(0)}
            </p>
            <p style="margin: 0; font-size: 12px;">units</p>
          </div>
          <div style="background-color: #dcfce7; padding: 15px; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #166534; font-size: 12px;">Batches Completed</p>
            <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold; color: #166534;">
              ${reportData.batchesCompleted}
            </p>
            <p style="margin: 0; font-size: 12px;">batches</p>
          </div>
        </div>

        <h3>Production by Product:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: right;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${productionHtml}
          </tbody>
        </table>

        <p><strong>Active Operators:</strong> ${reportData.activeOperators}</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Dairy Management System - Automated Daily Report</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Daily production report sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending daily production report:', error);
    return false;
  }
};

export default {
  testEmailConnection,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendLowStockAlert,
  sendExpirationWarning,
  sendPaymentReminder,
  sendDailyProductionReport,
};
