const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1 Create  a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //   2 define email options
  const mailOptions = {
    from: `aurelius821@gmail.com`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
