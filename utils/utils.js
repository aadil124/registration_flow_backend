import { response } from "express";
import nodemailer, { createTransport } from "nodemailer";

export const sendResetpasswordMail = async (name, email, id) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "",
        pass: "",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    var mailOptions = {
      from: "it.aadil124@gmail.com",
      to: email,
      subject: "Reset Password",
      html: `<p>Hii ${name}. Please copy this link <a href="http://localhost:9000/resetpassword/${token}" target=_blank>Click Here</a> and reset your password</p>`,
    };

    transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log("Message Sent");
      transporter.close();
    });
  } catch (error) {
    response.status(400).send({ success: false, msg: error.message });
  }
};
