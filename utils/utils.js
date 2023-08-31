import nodemailer from "nodemailer";
// import { response } from "express";

export const sendResetpasswordMail = async (name, email, token) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "it.aadil124@gmail.com",
        pass: "azhkokpbkublewcz",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    var mailOptions = {
      from: "it.aadil124@gmail.com",
      to: email,
      subject: "Reset Password",
      html: `<p>Hiii ${name},Please copy the link  <a href="http://localhost:3000/resetpassword/${token}"  target=_blank>click here </a>  and reset your password</p> `,
    };
    transporter.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
        return;
      }
      console.log("Message sent");
      transporter.close();
    });
  } catch (error) {
    response.status(400).send({ success: false, msg: error.message });
  }
};
