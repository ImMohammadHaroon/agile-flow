import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendTaskAssignmentEmail = async (recipientEmail, recipientName, taskTitle, assignerName, deadline) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Agile Flow <noreply@agileflow.com>',
      to: recipientEmail,
      subject: 'New Task Assigned - Agile Flow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .task-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Agile Flow</h1>
              <p style="margin: 5px 0 0 0;">Task Management System</p>
            </div>
            <div class="content">
              <h2>Hello ${recipientName},</h2>
              <p>You have been assigned a new task by <strong>${assignerName}</strong>.</p>
              
              <div class="task-box">
                <h3 style="margin-top: 0; color: #667eea;">Task Details</h3>
                <p><strong>Title:</strong> ${taskTitle}</p>
                <p><strong>Deadline:</strong> ${deadline ? new Date(deadline).toLocaleString() : 'No deadline set'}</p>
              </div>

              <p>Please log in to your dashboard to view complete task details and update the status.</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">View Task</a>

              <div class="footer">
                <p>This is an automated email from Agile Flow. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export default { sendTaskAssignmentEmail };
