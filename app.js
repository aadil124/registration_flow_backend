//import express,cors,mongoose
import express from 'express';
import bcrypt from "bcrypt";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';//high level abstraction
import  { createToken,jwtDecode }  from './middleware/middleware.js';
import  jwt from 'jsonwebtoken'
import { sendResetpasswordMail } from './utils/utils.js';


dotenv.config();//load the environment variable from .env file

const PORT=process.env.PORT;
const MONGO_URL=process.env.MONGO_URL;

//instance of express app
const app=express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());//middleware->parse url-encoded data 
// in submitting in req. body


mongoose.connect(
    MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    },()=>{
        console.log("MongoDb DB Connected Successfully");
    }
);
//Create Mongoose Schema for the User Model
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    forgotToken: {
        type: String,
        default: ''
      }
})


//create Mongoose model for User collection based on Schema
const User=new mongoose.model("User",userSchema);
app.get("/",(req,res)=>{
    res.send("Hello.Welcome to Registration and Login Backend");
})


app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email:email});
        if(user){
            //first do comparison with hashpassowrd
            const isPasswordValid=await bcrypt.compare(password,user.password);   
            if(isPasswordValid){
                const jwttoken = await createToken(user.email)
                res.status(200).send({message:"Login Successful",token:jwttoken});
            }else{
                res.send({message:"Password is not matched.."});
            }
        }else{
            res.send({message:"User is not found"});
        }
    } catch (error) {
        res.send({message:"An error occurred in login"})
    }
})
  


//Create a Route for Registration 


//code for register route with bcrypt
app.post("/register",async(req,res)=>{
    const {name,email,password}=req.body;

    try {
        const user=await User.findOne({email:email});
        // console.log(user,"user");
        if(user){
            res.send({message:"User Already Registered"});
        }else{
            const hashPassword=await bcrypt.hash(password,10);
            console.log(hashPassword,"hash");
            const newUser=new User({
                name:name,
                email:email,
                password:hashPassword
            });
            await newUser.save();
            res.send({message:"User Registered Successfully"});
        }
    } catch (error) {
        res.send({message:"An error is occurred " +error.message});
    }
})




app.post('/forgotpassword',async (req,res) =>{
   
    try {
        const user=await User.findOne({email:req.body.email});
    // creating a temporary token for verification
    console.log(user,"user");
    if(user !==null){
        const forgotToken = jwt.sign({email:req.body.email},process.env.JWT_SECRET,{expiresIn:'10m'})
        const data = await  User.updateOne({email:req.body.email},{$set:{forgotToken:forgotToken}});
        sendResetpasswordMail(user.name,user.email,forgotToken)
        res.send({
         statusCode:200,
         message:"Please check your email for to reset mail"
     })

     }else{
        res.send({
            message:"Email Not Found"
        })
     }

    } catch (error) {
        res.send({message:"An error is occured " +error.message});
    }
})


//To check token valid or not
// app.get('/resetpassword/:token', async (req,res)=>{
   
//     try {
//         const UserTokenData = await  User.findOne({forgotToken:req.params.token})
//         console.log(UserTokenData,"user");
//         if(UserTokenData !== null){
//             const decodeJWt = await jwtDecode(UserTokenData.forgotToken);
//             let currentTime = Math.round(new Date()/1000)// expiry date
//             if(currentTime<=decodeJWt.exp) {
//              console.log("hello");
//               res.send({
//                   statusbar:200,
//                   success:true,
//                   message:"Token verified Successfully",
                  
//               })
//           }
//           else{
//           // res.status(400).send({success:true,msg:"Link has been expired"})//
//             res.send({
//               statusbar:204,
//               success:true,
//               message:"Link has been expired",
//             })
    
//           }
//       }
//       else{
//           // res.status(400).send({success:true,msg:"This link has already used to reset password"})
//           res.send({
//           statusbar:204,
//             success:true,
//             message:"This link has already used to reset password",
//           })
//   }
//       } catch (error) {
//           // res.status(400).send({success:false,msg:"Error"})
//           res.send({
//             statusbar:204,
//             success:false,
//             message:"Error",
//             error:error
//           })
  
//       }
// })

//Update the password
// app.post('/newpassword/:token',async (req, res) =>{
//     try {
//         const {token} = req.params
//         const decoded = await jwtDecode(token);
//         const password = req.body.password
//         const hashPassword=await bcrypt.hash(password,10);
//         const user = await User.findOneAndUpdate({email:decoded.email},{$set:{password:hashPassword,forgotToken:""}},{new:true})
//         res.send({
//             statusbar:200,
//             success:true,
//             message:"Password Updated Successfully",
//             data:user
//         })
        
//       } catch (error) {
//         res.send({
//           statusCode:400,
//           message:error
//         })
//       }
// })

//To check token valid or not
app.get('/resetpassword/:token', async (req,res)=>{
   
    try {
        const UserTokenData = await  User.findOne({forgotToken:req.params.token})
        console.log(UserTokenData,"user");
        if(UserTokenData !== null){
            const decodeJWt = await jwtDecode(UserTokenData.forgotToken);
            let currentTime = Math.round(new Date()/1000)// expiry date
            if(currentTime<=decodeJWt.exp) {
             console.log("hello");
              res.send({
                  statusbar:200,
                  success:true,
                  message:"Token verified Successfully",
                  
              })
          }
          else{
          // res.status(400).send({success:true,msg:"Link has been expired"})//
            res.send({
              statusbar:204,
              success:true,
              message:"Link has been expired",
            })
    
          }
      }
      else{
          // res.status(400).send({success:true,msg:"This link has already used to reset password"})
          res.send({
          statusbar:204,
            success:true,
            message:"This link has already used to reset password",
          })
  }
      } catch (error) {
          // res.status(400).send({success:false,msg:"Error"})
          res.send({
            statusbar:204,
            success:false,
            message:"Error",
            error:error
          })
  
      }
})

//Update the password
app.post('/newpassword/:token',async (req, res) =>{
    try {
        const {token} = req.params
        const decoded = await jwtDecode(token);
        const password = req.body.password
        const hashPassword=await bcrypt.hash(password,10);
        const user = await User.findOneAndUpdate({email:decoded.email},{$set:{password:hashPassword,forgotToken:""}},{new:true})
        res.send({
            statusbar:200,
            success:true,
            message:"Password Updated Successfully",
            data:user
        })
        
      } catch (error) {
        res.send({
          statusCode:400,
          message:error
        })
      }
})

app.listen(PORT,()=>{
    console.log("App Started on Port "+ PORT);
})