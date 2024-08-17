import axios from './Instance';

// Définir l'URL de base de votre API
const API_BASE_URL = '/Email';

class EmailService {
  async sendEmail(toEmail, firstName, password) {
    const htmlContent = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #e9ecef;
        }
        .container {
            width: 90%;
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #0056b3;
            color: #ffffff;
            padding: 15px 25px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            padding: 20px;
            color: #333;
        }
        .footer {
            padding: 15px 25px;
            background-color: #f1f1f1;
            border-radius: 0 0 8px 8px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        h1 {
            color: #ffffff;
            margin: 0;
        }
        h2 {
            color: #333;
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
        .button {
            background-color: #0056b3;
            color: #ffffff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-size: 16px;
            margin-top: 10px;
            text-align: center;
        }
        .tips, .contact {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .contact {
            border: 1px solid #ddd;
            background-color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Platform!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${firstName}</strong>,</p>
            <p>Congratulations on joining our team! We are thrilled to have you with us. Below are your login credentials:</p>
            <p><strong>Email:</strong> ${toEmail}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>For your security, please change your password after your first login.</p>
            <p>If you have any questions or need assistance, do not hesitate to contact us.</p>
            <p>Best wishes and welcome aboard!</p>
            <div class="tips">
                <h2>Getting Started Tips:</h2>
                <p>- Make sure to update your profile with accurate details.</p>
                <p>- Explore our platform to become familiar with its features.</p>
                <p>- Reach out if you need any help or have questions.</p>
            </div>
            <div class="contact">
                <h2>Contact Us:</h2>
                <p>If you need support, you can reach us at:</p>
                <p><strong>Email:</strong> support@yourcompany.com</p>
                <p><strong>Phone:</strong> +1 (123) 456-7890</p>
                <p><strong>Address:</strong> 123 Business St, Suite 100, Your City, Your Country</p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

        `;

    try {
      const response = await axios.post(`${API_BASE_URL}/send`, {
        toEmail,
        subject: "Welcome to Our Platform!",
        message: htmlContent
      });
      return response.data;
    } catch (error) {
      console.error("There was an error sending the email:", error);
      throw error;
    }
  }

  async sendRequestEmail(toEmail, requestDetails) {
    const { startDate, endDate, note, userName } = requestDetails;

    const htmlContent = `
     <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            width: 90%;
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 15px 25px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            padding: 20px;
            color: #333;
        }
        .footer {
            padding: 15px 25px;
            background-color: #f1f1f1;
            border-radius: 0 0 8px 8px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        h1 {
            color: #ffffff;
            margin: 0;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
        .details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .signature {
            margin-top: 20px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Remote work Assignment</h1>
        </div>
        <div class="content">
            <p>Dear ${userName}</p>
            <p>Thank you for your exceptional work during this remote work period. Your dedication and performance have been greatly appreciated.</p>
            <p>For detailed information on the remote work arrangement, please check the web application.</p>
            <div class="details">
                <p><strong>Start Date:</strong> ${new Date(startDate).toDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(endDate).toDateString()}</p>
                <p><strong>Manager Note:</strong> ${note}</p>
            </div>
            <p>Keep up the great work!</p>
            
        </div>
        <div class="footer">
            <p>&copy; 2024 All rights reserved.</p>
        </div>
    </div>
</body>
</html>

    `;

    try {
      const response = await axios.post(`${API_BASE_URL}/send`, {
        toEmail,
        subject: "Request Submission Confirmation",
        message: htmlContent
      });
      return response.data;
    } catch (error) {
      console.error("There was an error sending the email:", error);
      throw error;
    }
  }

  async sendRequestUpdateEmail(toEmail, requestDetails) {
    const { startDate, endDate, comment, status, note, userName } = requestDetails;

    const statusDetails = {
      1: { text: 'Approved', color: '#28a745' },
      3: { text: 'Rejected', color: '#dc3545' }
    };

    const emailContent = `
     <!DOCTYPE html>
    <html lang="en">
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
          <header style="text-align: center; padding-bottom: 20px;">
            <h2 style="color: #007bff;">Request Update Notification</h2>
            <p style="font-size: 16px;">Hello <strong>${userName}</strong>,</p>
          </header>

          <section style="padding: 10px; border-bottom: 1px solid #ddd;">
            <p>Your request has been updated. Below are the details:</p>
            <ul style="list-style-type: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0;"><strong>Start Date:</strong> ${startDate}</li>
              <li style="padding: 8px 0;"><strong>End Date:</strong> ${endDate}</li>
              <li style="padding: 8px 0; color: ${statusDetails[status]?.color || '#000000'};">
                <strong>Status:</strong> ${statusDetails[status]?.text || 'Unknown'}
              </li>
              <li style="padding: 8px 0;"><strong>Comment:</strong> ${comment || 'N/A'}</li>
              <li style="padding: 8px 0;"><strong>Note:</strong> ${note || 'N/A'}</li>
            </ul>
          </section>

          <footer style="text-align: center; padding-top: 20px;">
            <p>If you have any questions or need further assistance, please feel free to contact us.</p>
            <p>Thank you for your attention to this matter.</p>
            <p style="font-style: italic;">Best regards,<br />The Team</p>
          </footer>
        </div>
      </body>
    </html>
  `;

    try {
      const response = await axios.post(`${API_BASE_URL}/send`, {
        toEmail,
        subject: "Request Update Notification",
        message: emailContent
      });
      return response.data;
    } catch (error) {
      console.error("There was an error sending the email:", error);
      throw error;
    }
  }


  async sendRequestEmailForManager(requestDetails) {
    try {
      const { emails, startDate, endDate, comment, userName, userEmail } = requestDetails;

      // Ensure emails array is not empty
      if (!Array.isArray(emails) || emails.length === 0) {
        throw new Error("Email list is empty.");
      }

      // Compose the email body with improved styling
      const emailBody = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 80%;
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
          }
          h2 {
            color: #0056b3;
          }
          .details {
            background: #e9ecef;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .details ul {
            list-style-type: none;
            padding: 0;
          }
          .details li {
            padding: 8px 0;
          }
          .footer {
            font-size: 0.9em;
            color: #666;
            text-align: center;
            margin-top: 20px;
          }
          .highlight {
            color: #007bff;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Request Submitted</h2>
          <div class="details">
            <p><strong>Request Details:</strong></p>
            <ul>
              <li><span class="highlight">Start Date:</span> ${startDate}</li>
              <li><span class="highlight">End Date:</span> ${endDate}</li>
              <li><span class="highlight">Comment:</span> ${comment}</li>
              <li><span class="highlight">Submitted By:</span>${userEmail}</li>
            </ul>
          </div>
          <p>Please review the request and take necessary action.</p>
          <p class="footer">Thank you for your attention!</p>
        </div>
      </body>
      </html>
    `;

      const response = await axios.post(`${API_BASE_URL}/sendList`, {
        emails,  // List of email addresses
        subject: 'New Request Submitted',
        body: emailBody // HTML email body
      });

      console.log('Emails sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending email:', error.response ? error.response.data : error.message);
      throw new Error('Failed to send email.');
    }
  }


}
export default new EmailService();

