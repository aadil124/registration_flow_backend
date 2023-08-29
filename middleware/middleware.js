import jwt from "jsonwebtoken";

//create a function jwt token based on email and id

export const createToken = async (email, id) => {
  //generate -> jwt token jwt.sign
  //process.env.JWT secret key
  let token = jwt.sign({ email, id }, process.env.JWT_SECRET, {
    expiresIn: "180m",
  });
  return token;
};

//function to decode the jwt token and retrieve the original payload data

export const jwtDecode = async (token) => {
  //use jwt.decode method to decode the token
  let data = jwt.decode(token);
  return data;
};
