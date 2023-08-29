//import express,cors,mongoose
import express from 'express';
import bcrypt from "bcrypt";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';//high level abstraction
import jwt from "jsonwebtoken";
import { createToken, jwtDecode } from './middleware/middleware.js';

dotenv.config();//load the environment variable from .env file

const PORT=process.env.PORT;
const MONGO_URL=process.env.MONGO_URL;
const JWT_SECRET=process.env.JWT_SECRET;

//instance of express app
const app=express();
// const PORT=9002;
// const MONGO_URL="mongodb+srv://jainmonula1:8JwnEmYTQlsg2lSe@cluster0.t9mtq4h.mongodb.net/myLoginRegisterDb";

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
    forgotToken:{
        type:String,
        default:''
    }
})


//create Mongoose model for User collection based on Schema
const User=new mongoose.model("User",userSchema);
app.get("/",(req,res)=>{
    res.send("Hello.Welcome to Registration and Login Backend");
})


//creat a route for Login based on User

// app.post("/login",(req,res)=>{
//     const {email,password}=req.body;

//     User.findOne({email:email},(err,user)=>{
//         if(user){
//             if(password===user.password){
//                 res.send({message:"Login Successful",user:user})
//             }else{
//                 res.send({message:"Password is not matched..."})
//             }
//         }else{
//             res.send({message:"User is not Found."})
//         }
//     })
// })


//Implement bcrypt algorithm to compare password and hashedpassword
app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email:email});
    if(user){
            //first do comparision with hashpassowrd
    const isPasswordValid=await bcrypt.compare(password,user.password);   
    if(isPasswordValid){
        //call the token from middle jwt
        const jwttoken=await createToken(user.email)
        res.status(200).send({message:"Login Successful",token:jwttoken})
     }else{
        res.send({message:"Password is not matched.."});
    }
    
}else{
    res.send({message:"User is not found"});
}
        
} catch (error) {
        res.send({message:"An error occured in login"})
    }
})
  


//Create a Route for Registration 
// app.post('/register',(req,res)=>{
//     const {name,email,password}=req.body;
    
//     User.findOne({email:email},(err,user)=>{
//         if(user){
//             res.send({message:"User Already Registered"});
//         }else{
//                 //create a new User instance object with 3 details
//             const user=new User({
//                 name:name,
//                 email:email,
//                 password:password
//             })

//             user.save((err)=>{
//                 if(err){
//                     res.send(err);
//                 }else{
//                     res.send({message:"User Registered Successfully"});
//                 }
//             })

//         }
//     })
// })


//code for register route with bcrypt
app.post("/register",async(req,res)=>{
    const {name,email,password}=req.body;

    try {
        const user=await User.findOne({email:email});
        if(user){
            res.send({message:"User Already Registered"});
        }else{
            const hashPassword=await bcrypt.hash(password,10);

            const newUser=new User({
                name:name,
                email:email,
                password:hashPassword
            });
            await newUser.save();
            res.send({message:"User Registered Successfully"});
        }
    } catch (error) {
        res.send({message:"An error is occured " +error.message});
    }
})


//Forgot password
app.post("/forgotpassword",async(req,res)=>{
       try {
        //Find the user by email
        const user=await User.findOne({email:req.body.email});

        //check if user exist in db or not
        if(user!=null){
            //Generate a temporaray token for verfication
            const forgotToken=jwt.sign({email:req.body.email},process.env.JWT_SECRET,{expiresIn:'2m'});
            const data=await User.updateOne({email:req.body.email},{$set:{forgotToken:forgotToken}});
            console.log(data);
            //send password reset email
            sendResetpasswordMail(user.name,user.email,forgotToken);

            //send sucess message
            res.send({
                data,
                statusCode:200,
                message:"Please check your email for the reset password link"
            })   
        }else{
            //send response if user is not found
            res.send({
                message:"Email not found"
            })
        }
       } catch (error) {
       }
})



//Reset password route to check token is valid or not
app.post("/resetpassword/:token",async(req,res)=>{
    try {
        //find the user in database  based on forgot Token
        const UserTokenData=await User.findOne({forgotToken:req.params.token});
        console.log(UserTokenData,"user");


        //check if UserTokenData data exist or not 
        if(UserTokenData!=null){
            //decode the jwt token store in  UserTokenData.forgotToken
            const decodeJWt=await jwtDecode(UserTokenData.forgotToken);

            //Get the current time in seconds
            let currentTime=Math.round(new Date()/1000);

            //check if ct<=token expiration time

            if(currentTime<=decodeJWt.exp){
                console.log("Hello");
                //if token is valid and not expired
                res.send({
                    statusbar:200,
                    success:true,
                    message:"Token Verified Successfully."
                })
            }else{
                res.send({
                    statusbar:204,
                    success:true,
                    message:"Link has been expired."
                })
            }

        }else{
            res.send({
                statusbar:204,
                success:true,
                message:"This link is already user to reset password."
            })
        }
        
    } catch (error) {
        res.send({
            statusbar:200,
            success:false,
            message:"Error.",
            error:error
        })
    }

})
  
//newpassword
app.post("/newpassword/:token",async(req,res)=>{

})


//Newpassword

app.listen(PORT,()=>{
    console.log("App Started on Port "+ PORT);
})