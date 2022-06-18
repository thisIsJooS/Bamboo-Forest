const nodemailer = require("nodemailer");

const mailSender = {
  sendGmail: function (param, next) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      requireTLS: true,
      auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: "Bamboo-Forest",
        address: process.env.MAIL_SENDER,
      },
      to: param.toEmail,
      subject: param.subject,
      text: param.text,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        next(error);
      } else {
        console.log(`Email sent : ${info.response}`);
      }
    });
  },
};

module.exports = mailSender;
