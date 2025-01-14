import mongoose, {Schema} from "mongoose";
import {  ProblemTypes, SubmissionStats } from "../types/problemTypes";


const inputSchema = new Schema({
    name: {type: String, required: true},
    value: {type: String, required: true},
})

const exampleSchema = new Schema({
    heading:{ type:String, required: true},
    inputs:{ type: [inputSchema], required: true},
    output:{ type: String, required: true},
    explanation: {type: String, required: true},
});

const testCaseSchema = new Schema({
    inputs: { type: [inputSchema] , required: true },
    output: { type: String, required: true },
});

const hintSchema = new Schema({
    content: { type: String, required: false },
});

const submissionSchema = new Schema<SubmissionStats>({
    user: {type:Schema.Types.ObjectId, ref:'User'},
    status: {type:String, enum: ['Accepted', 'Attempted', 'NILL'], default: 'NILL'},
    code: {type:String},
    language: {type:String},
    totalTestCasePassed: {type:Number, default: 0},
    totalTestCases: {type:Number, default:0},
    isFinal : {type:Boolean, default: false}
}  , {
    timestamps: true
});



const problemSchema = new Schema<ProblemTypes>({
   slno: { type: Number, required: true},
   title:{ type: String, require: true},
   description: {type: String, required: true},
   isBlock: { type: Boolean, default: false},
   difficulty: {
       type: String,
       required: true,
       enum: ['easy', 'medium', 'hard'],
   },
   tags: { type: [String], required: true},
   testCases: { type: [testCaseSchema], required: true},
   submission: {type: [submissionSchema]},
   totalSubmission: {type:Number, deafult:0},
   hints: { type: [hintSchema], required: false},
   examples: { type: [exampleSchema], required: true },
   averageRatings: {type: Number, default: 0},
   reviewCount: {type:Number, default: 0}
   
  }, {
    timestamps: true
});


const problemModal = mongoose.model<ProblemTypes>('Problem', problemSchema);
export default problemModal;