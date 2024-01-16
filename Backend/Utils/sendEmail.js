const nodemailer = require("nodemailer");
const sendEmail = async (subject, message, sentTo, sendFrom, replyTo) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    post: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // tls: {
    //   rejectUnauthorized: false,
    // },
  });

  //Options for sending email
  const options = {
    from: sendFrom,
    to: sentTo,
    replyTo,
    subject,
    html: message,
  };

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log("Error:", err);
    } else {
      console.log("Info", info);
    }
  });
};

module.exports = sendEmail;
