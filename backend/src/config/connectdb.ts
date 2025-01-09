import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

interface HandleDB{
    connectDB: () => Promise<void>
}

class DataBaseHandler implements HandleDB {
    async connectDB(): Promise<void> {
        try{
           const conn = await mongoose.connect(process.env.MONGO_URI as string);
           console.log('db connected successfully');
        }catch(error){ 
           if(error instanceof Error){
              console.log(error.message)
           }else{
              console.log('An unkown error occured while connect database');
           }
           process.exit(-1)
        }
    }
}

const dbHandler = new DataBaseHandler();
export default dbHandler.connectDB;