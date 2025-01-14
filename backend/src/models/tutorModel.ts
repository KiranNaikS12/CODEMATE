import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { Role } from "../types/commonTypes";
import { ITutor } from "../types/tutorTypes";

const tutorSchema = new Schema<ITutor>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    roleId: {
      type: String,
      enum: Object.values(Role),
      default: Role.Tutor,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    fullname: {
      type: String,
    },
    age: {
      type: String,
    },
    contact: {
      type:String
    },
    country: {
      type: String,
    },
    birthday: {
      type: String,
    },
    bio: {
      type: String,
    },
    specialization: {
      type: String,
    },
    education: {
      type: String,
    },
    company: {
      type: String,
    },
    experience: {
      type: String,
    },
    certificate: {
      data: Buffer,
      contentType: String,
    },
    website: {
      type:String,
    },
    isApproved: {
        type:Boolean,
        default:false
    },
    isVerified: {
      type:Boolean,
      default:false
    },
    profileImage: {
      type:String,
      default:''
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tutorSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const Tutor = mongoose.model("Tutor", tutorSchema);
export default Tutor;

