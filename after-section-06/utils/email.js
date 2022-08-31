const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    //service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    // activate in gmail "less secure app" option
  });

  // define the email options
  const mailOptions = {
    from: 'ketul marfatia <ketulm@yahoo.in>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };
  //send mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
