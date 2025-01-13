import mongoose, { Schema} from 'mongoose';
import bcrypt from 'bcryptjs';
import {Role} from '../types/commonTypes'
import { IUser } from '../types/userTypes';


const userSchema = new Schema<IUser>({
    username:{
        type:String,
        required:true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    roleId:{
        type:String,
        enum:Object.values(Role),
        default:Role.User
    },
    fullname:{
        type:String,
    },
    birthday:{
        type:String,
    },
    country:{
        type:String,
    },
    bio:{
        type:String,
    },
    website:{
        type:String,
    },
    work: {
        type:String
    },
    education:{
        type:String
    },
    technicalSkills:{
        type:String
    },
    profileImage: {
        type: String,
        default:''
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true
    },
    solvedEasy: {
        solvedCount: {
            type: Number,
            default: 0
        },
        totalPercentage: {
            type: Number,
            default: 0
        },
        solvedProblemIds: {
            type: [String], 
            default: []
        }
    },
    solvedMedium: {
        solvedCount: {
            type: Number,
            default: 0
        },
        totalPercentage: {
            type: Number,
            default: 0
        },
        solvedProblemIds: {
            type: [String],
            default: []
        }
    },
    solvedHard: {
        solvedCount: {
            type: Number,
            default: 0
        },
        totalPercentage: {
            type: Number,
            default: 0
        },
        solvedProblemIds: {
            type: [String],
            default: []
        }
    },
    totalSubmission: { 
        count: { 
            type: Number, 
            default: 0 
        },
        submissions: [{
            problemId: {
                type: String,
                required: true
            },
            submittedAt: {
                type: Date,
                default: Date.now
            },
            title: {
                type: String
            },
            status: {
                type: String
            },
            language: {
                type: String
            },
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard'],
                required: true
            }
        }]
    },

},{
    timestamps:true
});


userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema)
export default User;
