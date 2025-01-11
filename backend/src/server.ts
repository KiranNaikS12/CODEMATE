import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import connectdb from './config/connectdb';
import authRoute from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import tutorRoutes from './routes/tutorRoutes';
import adminRoutes from './routes/adminRoute';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { TokenBlacklistService } from './services/tokenService/tokenBlacklist';
import { checkBlacklistedToekn } from './middleware/tokenBlacklistMiddleware';
import { container } from './config/di-containers';
import { app, server, SocketServiceClass } from './config/socket';

dotenv.config()
connectdb()


const PORT = process.env.PORT || 3000;
const SocketService = container.get<SocketServiceClass>('SocketService');
SocketService.initialize()
const blacklistService = container.get<TokenBlacklistService>('TokenBlacklistService')

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
    
}))
app.use(checkBlacklistedToekn(blacklistService))

app.use('/auth', authRoute);
app.use('/users',userRoutes);
app.use('/tutors',tutorRoutes);
app.use('/admin', adminRoutes);
app.use(errorHandler);

process.on('SIGTERM', async () => {
    await blacklistService.cleanup();
    process.exit(0);
});

server.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})
