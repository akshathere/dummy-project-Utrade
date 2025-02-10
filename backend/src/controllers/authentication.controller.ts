import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET|| 'your_access_secret_key'; // Replace with your secure secret
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_key'
let refreshTokens : string[]=[]
export const deleteRefreshToken = async (req: Request,res: Response): Promise<void> =>{
  refreshTokens= refreshTokens.filter(token => token!== req.body.token)
  res.sendStatus(204)
}
// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log("User created, " , username,email,password)
    res.json({ message: 'User created successfully.', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Login
export const login = async (req: Request, res: Response):Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user!.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const Accesstoken = generateAccessToken(user?.id) 
    const Refreshtoken = generateRefreshToken(user?.id);
    refreshTokens.push(Refreshtoken)
    res.status(200).json({Accesstoken: Accesstoken, Refreshtoken: Refreshtoken});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const GetFreshAcessToken  = async (req:Request, res: Response) : Promise<void>=>{
  const refreshToken = req.body.token
  if(refreshToken==null) res.sendStatus(401)
  if(!refreshTokens.includes(refreshToken)) res.sendStatus(403)
  try {
              const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
              //@ts-ignore
             const Accesstoken= generateAccessToken( decoded.userId)
             res.status(200).json({Accesstoken : Accesstoken})
              // Assuming the token payload contains `userId`
            }
          catch (error) {
                  console.log("error")
                  console.error("Error jwt token authentication", error);
                  res.sendStatus(403).json({ error: "Token no longer valid" });// 403 for token is not valid now
              }
}
function generateAccessToken(userId : number | undefined){
  return jwt.sign({userId},ACCESS_TOKEN_SECRET, {expiresIn: '1m'});
}
function generateRefreshToken(userId : number | undefined){
  return jwt.sign({userId},REFRESH_TOKEN_SECRET, {expiresIn: '24h'});
}