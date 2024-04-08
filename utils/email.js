const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Rudraksh Joshi<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV == 'production') {
      // send mail using elastic email service

      return nodemailer.createTransport({
        host: process.env.EMAIL_PROD_HOST,
        port: process.env.EMAIL_PROD_PORT,
        auth: {
          user: process.env.EMAIL_PROD_USERNAME,
          pass: process.env.EMAIL_PROD_PASSWORD,
        },
      });
    }
    // development mail trap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual mail
  async send(template, subject) {
    // 1) Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    // 3) create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome the platform hope you have a good time 😀',
    );
  }
  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)',
    );
  }
};

// reference
// const sendEmail = async (options) => {
//   // 1 Create  a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   //   2 define email options
//   const mailOptions = {
//     from: `aurelius821@gmail.com`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html
//   };
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
