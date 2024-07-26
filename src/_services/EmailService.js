import axios from 'axios';

// Définir l'URL de base de votre API
const API_BASE_URL = 'https://localhost:7157/api/Email';

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
}

export default new EmailService();

