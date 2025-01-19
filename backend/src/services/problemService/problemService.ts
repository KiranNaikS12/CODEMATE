import { injectable, inject } from "inversify";
import { AuthMessages } from "../../utils/message";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { CustomError } from "../../utils/customError";
import { IProblemRepository } from "../../repositories/problems/IProblemRepository";
import { CodeRunTypes, CodeSubmissionResultType, FilterOptions, ProblemTypes} from "../../types/problemTypes";
import { exec } from "child_process";
import _ from 'lodash';
import { IUserRepository } from "../../repositories/user/IUserRepository";
import path from 'path';
import fs from 'fs/promises'
import { IProblemService } from "./IProblemService";
import { UpdateQuery } from "mongoose";

//utitlity function to promisfy exec
const executeCode = (command: string): Promise<{ stdout: string; stderr: string }> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else if (stderr) {
                reject(new Error(stderr));
            } else {
                resolve({ stdout, stderr });
            }
        })
    })
}

@injectable()
export class ProblemService implements IProblemService {
    constructor(
        @inject('ProblemRepository') private ProblemRepository: IProblemRepository,
        @inject('UserRepository') private UserRepository: IUserRepository,
    ) { }


    async createNewProblem(problemDetails: Partial<ProblemTypes>): Promise<ProblemTypes | null> {
        try {
            const problemData = {
                ...problemDetails,
                isBlock: false,
            }
            const problem = await this.ProblemRepository.create(problemData);
            return problem;
        } catch (error) {
            console.error('Error creating problem:', error);
            throw new CustomError(AuthMessages.FAILED_TO_CREATE_PROBLEM, HttpStatusCode.BAD_REQUEST)
        }
    }

    async listProblems(filters: FilterOptions, page: number = 1, limit: number = 8): Promise<{ problems: ProblemTypes[], total: number }> {
        const problemsResult = await this.ProblemRepository.listProblems(filters, page, limit);
        if (!problemsResult.problems || problemsResult.problems.length === 0) {
            return { problems: [], total: 0 };
        }

        return problemsResult;
    }


    async updatePromblemStatus(id: string, isBlock: boolean): Promise<ProblemTypes | null> {
        const problem = await this.ProblemRepository.updateProblemStatus(id, { isBlock });
        if (!problem) {
            throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND)
        }
        return problem;
    }

    async getProblemData(problemId: string, userId: string): Promise<ProblemTypes | null> {
        if (!problemId) throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        const problem = await this.ProblemRepository.findOne({ _id: problemId });
        if (!problem) throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);

        let userSubmission = null;

        if (userId) {
            userSubmission = problem?.submission?.filter(
                (submission) => submission.user.toString() === userId
            );


        }

        return {
            ...problem.toObject(),
            submission: undefined,
            userSubmission,
        };
    }


    async runCode(
        sourceCode: string,
        problemId: string
    ): Promise<CodeRunTypes[]> {
        try {
            const problem = await this.ProblemRepository.findOne({ _id: problemId });
            if (!problem) {
                throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            // Initialize results array
            const result: CodeRunTypes[] = [];

            for (const example of problem.examples) {
                const inputParams = example.inputs.map((input) => JSON.parse(input.value))
                const expectedOutput = example.output;

                // Extract function name from user-provided code
                const functionNameMatch = sourceCode.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
                if (!functionNameMatch) {
                    throw new Error('No function found in the provided code.');
                }
                const functionName = functionNameMatch[1];


                // Validate function arguments match the number of inputs
                const functionArgMatch = sourceCode.match(new RegExp(`function\\s+${functionName}\\s*\\(([^)]*)`));
                if (functionArgMatch) {
                    const expectedArgCount = functionArgMatch[1].split(',').length;
                    if (expectedArgCount !== inputParams.length) {
                        result.push({
                            exampleId: example._id.toString(),
                            passed: false,
                            actualOutput: null,
                            expectedOutput: example.output,
                            logs: [`Error: Function expects ${expectedArgCount} arguments, but received ${inputParams.length}`]
                        });
                        continue;
                    }
                }

                // Wrap user-provided code
                const wrappedCode = `
                    const capturedLogs = [];
                    const originalLog = console.log;
                    console.log = (...args) => { 
                        capturedLogs.push(args.join(' ')); 
                        originalLog(...args); 
                    };
    
                    try {
                        ${sourceCode}
                        const result = ${functionName}(${inputParams.map(param => JSON.stringify(param)).join(', ')});
                        console.log = originalLog;
    
                        process.stdout.write(JSON.stringify({ result, logs: capturedLogs }));
                    } catch (error) {
                        console.log = originalLog;
                        process.stdout.write(JSON.stringify({ error: error.message, logs: capturedLogs }));
                    }
                `;

                const tempFilePath = path.join(__dirname, `temp-${Date.now()}.js`);
                await fs.writeFile(tempFilePath, wrappedCode);

                try {
                    const { stdout } = await executeCode(`node ${tempFilePath}`);

                    // Attempt to isolate JSON output
                    const jsonStartIndex = stdout.indexOf("{");
                    const jsonEndIndex = stdout.lastIndexOf("}");
                    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                        throw new Error("No valid JSON output found.");
                    }

                    const jsonOutput = stdout.slice(jsonStartIndex, jsonEndIndex + 1);
                    const parsedOutput = JSON.parse(jsonOutput);

                    console.log('parsedOutput:', parsedOutput);

                    const actualOutput = parsedOutput.result;
                    const logs = parsedOutput.logs;

                    let parsedExpectedOutput;
                    try {
                        parsedExpectedOutput = JSON.parse(expectedOutput);
                    } catch (e) {
                        parsedExpectedOutput = expectedOutput;
                    }

                    let passed = false;

                    // Compare actual and expected outputs
                    if (typeof parsedExpectedOutput === 'number' && typeof actualOutput === 'number') {
                        passed = parsedExpectedOutput === actualOutput;
                    } else if (typeof parsedExpectedOutput === 'boolean' && typeof actualOutput === 'boolean') {
                        passed = parsedExpectedOutput === actualOutput;
                    } else if (typeof parsedExpectedOutput === 'string' && typeof actualOutput === 'string') {
                        passed = parsedExpectedOutput === actualOutput;
                    } else {
                        passed = false;
                    }

                    console.log(actualOutput)

                    result.push({ exampleId: example._id.toString(), passed, actualOutput, expectedOutput, logs });
                } catch (error) {
                    console.error(`Error executing code for example ${example._id}:`, error);
                    result.push({
                        exampleId: example._id.toString(),
                        passed: false,
                        actualOutput: null,
                        expectedOutput,
                        logs: ["Error during execution"]
                    });
                } finally {
                    await fs.unlink(tempFilePath);
                }
            }

            return result;
        } catch (error) {
            console.error('Error running code:', error);
            throw new CustomError(AuthMessages.FAILED_TO_RUN_CODE, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async handleCodeSubmission(
        sourceCode: string,
        language: string,
        problemId: string,
        userId: string
    ): Promise<{
        meta: {
            totalTestCases: number,
            passedTestCases: number
        },
        results: CodeSubmissionResultType[]
    }> {
        try {
            const problem = await this.ProblemRepository.findOne({ _id: problemId });
            const user = await this.UserRepository.findById(userId);

            if (!user) {
                throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }
            if (!problem) {
                throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            let passedTestCases = 0;
            const totalTestCases = problem.testCases.length;

            const submissionResult: CodeSubmissionResultType[] = [];

            for (const test of problem.testCases) {
                const inputParams = test.inputs.map((input) => JSON.parse(input.value))
                const expectedOutput = test.output;

                const functionNameMatch = sourceCode.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
                if (!functionNameMatch) {
                    throw new Error('No function found in the provided code.');
                }

                const functionName = functionNameMatch[1];

                const functionArgMatch = sourceCode.match(new RegExp(`function\\s+${functionName}\\s*\\(([^)]*)`));
                if (functionArgMatch) {
                    const expectedArgCount = functionArgMatch[1].split(',').length;
                    if (expectedArgCount !== inputParams.length) {
                        submissionResult.push({
                            testCaseId: test._id.toString(),
                            passed: false,
                            actualOutput: null,
                            expectedOutput: test.output,
                        });
                        continue;
                    }
                }

                const wrappedCode = `
                ${sourceCode}
                try {
                    const result = ${functionName}(${inputParams.map(param => JSON.stringify(param)).join(', ')});
                    console.log(result === undefined ? 'undefined' : 
                        result === null ? 'null' : 
                        typeof result === 'object' ? JSON.stringify(result) : 
                        result.toString());
                } catch (error) {
                    console.error(error.message);
                    process.exit(1);
                }
            `;

                const tempFilePath = path.join(__dirname, `temp-${Date.now()}.js`);

                try {
                    await fs.writeFile(tempFilePath, wrappedCode);

                    const { stdout, stderr } = await executeCode(`node ${tempFilePath}`);

                    if (stderr) {
                        console.error('Execution error:', stderr);
                        submissionResult.push({
                            testCaseId: test._id.toString(),
                            passed: false,
                            actualOutput: stderr,
                            expectedOutput: expectedOutput,
                            input: inputParams
                        });
                        continue;
                    }

                    let actualOutput;
                    let parsedExpectedOutput;

                    try {
                        actualOutput = stdout.trim() === 'undefined' ? undefined : JSON.parse(stdout.trim());
                    } catch (parseError) {
                        actualOutput = stdout.trim();
                        console.error('Could not parse stdout:', parseError);
                    }

                    try {
                        parsedExpectedOutput = JSON.parse(expectedOutput);
                    } catch (e) {
                        parsedExpectedOutput = expectedOutput;
                    }

                    console.log("actualOutput", actualOutput);
                    console.log("parsedExpectedOutput", parsedExpectedOutput)

                    let passed = false;
                    if (actualOutput === undefined && parsedExpectedOutput === undefined) {
                        passed = true;
                        passedTestCases += 1;
                    } else if (typeof parsedExpectedOutput === 'number' && typeof actualOutput === 'number') {
                        passed = parsedExpectedOutput === actualOutput;
                    } else if (typeof parsedExpectedOutput === 'boolean' && typeof actualOutput === 'boolean') {
                        passed = parsedExpectedOutput === actualOutput;
                    } else if (typeof parsedExpectedOutput === 'string' && typeof actualOutput === 'string') {
                        passed = parsedExpectedOutput === actualOutput;
                    } else {
                        passed = false;
                    }

                    if (passed) {
                        passedTestCases += 1;
                    }

                    submissionResult.push({
                        testCaseId: test._id.toString(),
                        passed,
                        expectedOutput: parsedExpectedOutput,
                        actualOutput: actualOutput === undefined ? 'undefined' : actualOutput,
                        input: inputParams
                    });

                } catch (error) {
                    console.error(`Error executing code for test case ${test._id}:`, error);
                    submissionResult.push({
                        testCaseId: test._id.toString(),
                        passed: false,
                        expectedOutput: expectedOutput,
                        input: inputParams
                    });
                } finally {
                    try {
                        await fs.unlink(tempFilePath);
                    } catch (unlinkError) {
                        console.error('Error deleting temp file:', unlinkError);
                    }
                }
            }

            const existingFinalSubmission = problem.submission?.find(
                sub => sub.user.toString() === user._id.toString() && sub.isFinal
            )

            const isAccepted = passedTestCases === totalTestCases;

            const submissionData = {
                user: userId,
                status: passedTestCases === totalTestCases ? 'Accepted' : 'Attempted',
                language,
                code: sourceCode,
                totalTestCasePassed: passedTestCases,
                totalTestCases,
                isFinal: isAccepted && !existingFinalSubmission,
            };

            await this.ProblemRepository.update(
                problemId,
                {
                    $push: { submission: submissionData },
                    $inc: { totalSubmission: 1 },
                } as UpdateQuery<ProblemTypes>
            );

            const totalProblemCounts = await this.ProblemRepository.totalProblems();

            console.log('lan', language)

            user.totalSubmission!.count += 1;
            user.totalSubmission!.submissions.push({
                problemId,
                submittedAt: new Date(),
                difficulty: problem.difficulty,
                title: problem.title,
                language: language,
                status: passedTestCases === totalTestCases ? 'Accepted' : 'Attempted', 
            });

            user.save()

            if (isAccepted && submissionData.isFinal) {
                await this.updateUserProgress(userId, problemId, problem.difficulty)
            }

            
            return {
                meta: {
                    totalTestCases,
                    passedTestCases
                },
                results: submissionResult
            };

        } catch (error) {
            console.error('Error in code submission process:', error);
            throw new CustomError(
                AuthMessages.FAILED_CODE_SUBMISSION,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateUserProgress(userId: string, problemId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void> {
        try {
            const user = await this.UserRepository.findById(userId);
            if (!user) {
                throw new CustomError(AuthMessages.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }
            const problem = await this.ProblemRepository.findOne({ _id: problemId });
            if (!problem) {
                throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);
            }

            const totalProblemCounts = await this.ProblemRepository.countDocuments(difficulty);



            let progressField: 'solvedEasy' | 'solvedMedium' | 'solvedHard';
            switch (difficulty) {
                case 'easy':
                    progressField = 'solvedEasy';
                    break;
                case 'medium':
                    progressField = 'solvedMedium';
                    break;
                case 'hard':
                    progressField = 'solvedHard';
                    break;
            }

            const isAlreadySolved = user[progressField]?.solvedProblemIds.includes(problemId);

            if (!isAlreadySolved) {
                user[progressField]?.solvedProblemIds.push(problemId);
            }



            user[progressField]!.solvedCount += 1;

            console.log("totalProblemCounts", totalProblemCounts)
            user[progressField]!.totalPercentage = parseFloat(((user[progressField]!.solvedCount / totalProblemCounts) * 100).toFixed(1));

            console.log('percentage', user[progressField]!.totalPercentage)

            await user.save()

        }

        catch (error) {
            throw new CustomError(AuthMessages.FAILED_UPDATE_USER_PROGRESS, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getTotalProblemCounts(): Promise<{ easy: number; medium: number; hard: number; total: number }> {
        const stats = await this.ProblemRepository.totalProblems()

        return stats;
    }


    async updateBasicDetails(problemId: string, basicDetails: Partial<ProblemTypes>): Promise<Partial<ProblemTypes>> {
        if (!problemId) throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        const updateProblem = await this.ProblemRepository.update(problemId, basicDetails);
        if (!updateProblem) {
            throw new CustomError(AuthMessages.FAILED_TO_UPDATE, HttpStatusCode.BAD_REQUEST)
        }
        return updateProblem;
    }

    async updateAdditionalDetails(problemId: string, additionDetails: Partial<ProblemTypes>): Promise<Partial<ProblemTypes>> {
        if (!problemId) throw new CustomError(AuthMessages.PROBLEM_NOT_FOUND, HttpStatusCode.NOT_FOUND);
        const updateProblem = await this.ProblemRepository.update(problemId, additionDetails);
        if (!updateProblem) {
            throw new CustomError(AuthMessages.FAILED_TO_UPDATE, HttpStatusCode.BAD_REQUEST)
        }

        return updateProblem;
    }

}