import { NextFunction, Request, Response } from 'express';
import jwt from "jsonwebtoken"
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET|| 'your_access_secret_key'; // Replace with your secure secret

const authenticate= (req:Request,res:Response,next:NextFunction)=>{
        // Skip if it's an OPTIONS request, because we've handled that above
        if (req.method === 'OPTIONS') {
          next();
        }
      
        const authHeader = req.headers.authorization;
        console.log(authHeader)
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authorization token missing or invalid' }); // they have not send a token to us
            return
          }
        
          const token = authHeader.split(' ')[1]; // Extract the token
        
          try {
            console.log("validating token")
            console.log(token)
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            //@ts-ignore
            req.userId = decoded.userId; // Assuming the token payload contains `userId`
          }
        catch (error) {
                console.log("token invalid")
                res.status(403).json({ error: "Token no longer valid" });// 403 for token is not valid now
                return
            }
        next();
};
export {authenticate}
      
