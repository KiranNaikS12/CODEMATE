import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useListProblemDataQuery, useUpdateAdditionalProblemDetailsMutation, useUpdateBasicProblemInfoMutation } from '../../services/adminApiSlice';
import { AdditionalFormValues, BasicFormValues, staticTags } from '../../types/problemTypes';
import { Field, Form, Formik, FieldArray, ErrorMessage } from 'formik';
import { APIError } from '../../types/types';
import { toast, Toaster } from 'sonner';
import { additionalInfoValidationSchema, updateBasicProblemInfoValidationSchema } from '../../utils/validation';
import { isEqual } from 'lodash';

export interface BasicFormTyeps {
  title: string;
  description: string;
  slno: number;
  difficulty: string;
  tags: string[];
}

export interface AdditionFormTypes {
  testCases: { inputs: { name: string; value: string }[]; output: string }[];
  examples: { heading: string; output: string; explanation: string }[];
  hints: { content: string }[];
}

const EditProblemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: problemResponse, refetch } = useListProblemDataQuery(id!);
  const problem = problemResponse?.data;
  console.log(problemResponse)
  const navigate = useNavigate()
  const [updateBasicInfo] = useUpdateBasicProblemInfoMutation();
  const [updateAdditionInfo] = useUpdateAdditionalProblemDetailsMutation();
  const [selectedTags, setSelectedTags] = useState<string[]>(problem?.tags || []);
  const [basicInitialValues, setBasicInitialValues] = useState<BasicFormValues>({
    title: '',
    slno: 0,
    description: '',
    difficulty: 'Easy',
    tags: []
  });
  
  const [additionalInitialValues, setAdditionalInitialValues] = useState<AdditionalFormValues>({
    testCases: [],
    examples: [{
      _id: '',
      heading: '',
      inputs: [{ _id: '', name: '', value: '' }],
      output: '',
      explanation: '',
    }],
    hints: [{ _id: '', content: '' }],
  });

  useEffect(() => {
    if (problem) {
      setSelectedTags(problem.tags);
      setBasicInitialValues({
        title: problem.title,
        slno: problem.slno,
        description: problem.description,
        difficulty: problem.difficulty,
        tags: problem.tags
      });
      
      setAdditionalInitialValues({
        testCases: problem.testCases,
        examples: problem.examples?.length 
          ? problem.examples
          : [{
              _id: '',
              heading: 'Example 1',
              inputs: [{ _id: '', name: '', value: '' }],
              output: '',
              explanation: '',
            }],
        hints: problem.hints?.length ? problem.hints : [{ _id: '', content: '' }],
      });
    }
  }, [problem]);

  const allTags = Array.from(new Set([...staticTags, ...(problem?.tags || [])]));

  const handleTagChange = (tag: string) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };




  const handleBasicSubmit = async (values: BasicFormTyeps) => {

    const currentValues = {
      ...values,
      tags: selectedTags
    };

    const comparisonValues = {
      ...basicInitialValues,
      tags: problem?.tags || []
    };
    
    if (isEqual(currentValues, comparisonValues)) {
      toast.info('No changes detected');
      return;
    }

    const problemData = {
      problemId: problem?._id,
      problemData: {
        ...values,
        tags: selectedTags
      }
    };

    try {
      const response = await updateBasicInfo(problemData).unwrap();
      if (response) {
        toast.success(response?.message);
        refetch()
        setTimeout(() => {
          navigate('/admin/problems')
        }, 2000)
      }
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      }
    }
  };


  const handleAdditionalSubmit = async (values: AdditionFormTypes) => {

    if (isEqual(values, additionalInitialValues)) {
      toast.info('No changes detected');
      return;
    }

    const problemDetails = {
      problemId: problem?._id,
      problemData: {
        ...values
      }
    };

    try {

      const response = await updateAdditionInfo(problemDetails).unwrap();
      if (response) {
        toast.success(response?.message);
        refetch()
        setTimeout(() => {
          navigate('/admin/problems')
        }, 2000)
      }

    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      }
    }
  }


  return (
    <div className="flex flex-col items-start min-h-screen min-w-screen xl:mr-10">
      <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#D8D8FD" } }}
        richColors
      />
      <div>
        <h1 className='mb-2 text-lg font-bold text-themeColor'>BASIC INFO</h1>
      </div>
      <div className="w-full p-4 border rounded-lg shadow-inner">
        <Formik
          enableReinitialize={true} //To make sure
          initialValues={basicInitialValues}
          validationSchema={updateBasicProblemInfoValidationSchema}
          onSubmit={handleBasicSubmit}
        >
          <Form className='space-y-4'>
            {/* TITLE */}
            <div className='flex flex-col space-y-2'>
              <label htmlFor="title" className="block text-md">Title: </label>
              <Field
                id="title"
                type="text"
                name="title"
                className="w-full p-2 text-gray-500 border rounded-lg"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-sm italic text-red-500"
              />
            </div>

            {/* DESCRIPTION */}
            <div className='flex flex-col space-y-2'>
              <label htmlFor="description" className="block text-md">Description: </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                className="w-full p-2 text-gray-500 border rounded-lg"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-sm italic text-red-500"
              />
            </div>

            {/* SERIAL NUMBER AND DIFFICULTY */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label htmlFor="slno" className="block text-md">Serial Number:</label>
                <Field
                  id="slno"
                  type="number"
                  name="slno"
                  className="w-full p-2 text-gray-500 border rounded-lg"
                />
                <ErrorMessage
                  name="slno"
                  component="div"
                  className="text-sm italic text-red-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="difficulty" className="block text-md">Difficulty:</label>
                <Field
                  as="select"
                  id="difficulty"
                  name="difficulty"
                  className="w-full p-2 text-gray-500 border rounded-lg"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Field>
                <ErrorMessage
                  name="difficulty"
                  component="div"
                  className="text-sm italic text-red-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="tags" className="block text-md">Tags:</label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {allTags.map((tag) => (
                  <label key={tag} className="inline-flex items-center space-x-2">
                    <Field
                      type="checkbox"
                      name='tags'
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      className="form-checkbox"
                    />
                    <span>{tag}</span>

                  </label>
                ))}
              </div>
              <ErrorMessage
                name="tags"
                component="div"
                className="text-sm italic text-red-500"
              />
            </div>

            {/* Display Selected Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-sm text-white bg-blue-500 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 rounded text-customGrey bg-themeColor hover:bg-highlightBlue">
                Save Changes
              </button>
            </div>
          </Form>
        </Formik>
      </div>

      {/* Addition Details */}
      <div className='mb-2'>
        <h1 className='mt-8 mb-1 text-lg font-bold text-themeColor'>ADDITIONAL INFO</h1>
        <p className='text-sm font-medium text-hoverColor'>Note: <span className='font-normal'>Please make sure to update essential testcases and corresponding inputs properly..</span></p>
      </div>
      <div className="w-full p-4 border rounded-lg shadow-inner">
        <Formik
          enableReinitialize={true}
          initialValues={additionalInitialValues}
          validationSchema={additionalInfoValidationSchema}
          onSubmit={handleAdditionalSubmit}
        >
          {({ values }) => (
            <Form className="space-y-6">
              {/* Test Cases Section */}
              <div>
                <h2 className="mb-2 font-semibold text-md">Test Cases</h2>
                <FieldArray name="testCases">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.testCases.map((testCase, index) => (
                        <div key={index} className="p-4 space-y-6 border rounded-lg">
                          <h3 className="text-sm font-medium">Test Case {index + 1}</h3>
                          <FieldArray name={`testCases[${index}].inputs`}>
                            {({ remove: removeInput, push: pushInput }) => (
                              <div>
                                <h4 className="mb-1 text-sm font-semibold">Inputs</h4>
                                {testCase.inputs.map((input, inputIndex) => (
                                  <div key={input._id} className="flex space-x-4 2">
                                    <div className='flex flex-col '>
                                      <Field
                                        name={`testCases[${index}].inputs[${inputIndex}].name`}
                                        placeholder="Input Name"
                                        className="p-2 mb-2 border rounded-lg"
                                      />
                                      <ErrorMessage
                                        name={`testCases[${index}].inputs[${inputIndex}].name`}
                                        component="div"
                                        className="text-sm italic text-red-500"
                                      />
                                    </div>
                                    <div className='flex flex-col '>
                                      <Field
                                        name={`testCases[${index}].inputs[${inputIndex}].value`}
                                        placeholder="Input Value"
                                        className="p-2 mb-2 border rounded-lg"
                                      />
                                      <ErrorMessage
                                        name={`testCases[${index}].inputs[${inputIndex}].value`}
                                        component="div"
                                        className="text-sm italic text-red-500"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeInput(inputIndex)}
                                      className="text-sm text-red-500"
                                    >
                                      - Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => pushInput({ name: '', value: '' })}
                                  className="text-sm font-bold text-green-500"
                                >
                                  + Add Input
                                </button>
                              </div>
                            )}
                          </FieldArray>
                          <div>
                            <label className="block mb-1 text-sm font-medium">Output</label>
                            <Field
                              name={`testCases[${index}].output`}
                              placeholder="Output"
                              className="w-full p-2 border rounded-lg"
                            />
                            <ErrorMessage
                              name={`testCases[${index}].output`}
                              component="div"
                              className="text-sm italic text-red-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-sm text-red-500"
                          >
                            - Remove Test Case
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push({ inputs: [{ name: '', value: '' }], output: '' })}
                        className="mt-4 font-bold text-green-500"
                      >
                        +Add Test Case
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Examples Section */}
              <div>
                <h2 className="mb-2 font-semibold text-md">Examples</h2>
                <FieldArray name="examples">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.examples.map((example, index) => (
                        <div key={example._id} className="p-4 space-y-4 border rounded-lg">
                          <h3 className="text-sm font-medium">Example {index + 1}</h3>
                          <div>
                            <label className="block text-sm font-medium">Heading</label>
                            <Field
                              name={`examples[${index}].heading`}
                              placeholder="Header"
                              className="w-full p-2 border rounded-lg"
                            />
                            <ErrorMessage
                              name={`examples[${index}].heading`}
                              component="div"
                              className="text-sm italic text-red-500"
                            />
                          </div>
                          {/* Inputs */}
                          <div>
                            <label className="block text-sm font-medium">Inputs</label>
                            <FieldArray name={`examples[${index}].inputs`}>
                              {({ remove: removeInput, push: pushInput }) => (
                                <div className="space-y-2">
                                  {example.inputs?.map((input, inputIndex) => (
                                    <div
                                      key={inputIndex}
                                      className="flex items-center space-x-2"
                                    >
                                      <div className='flex flex-col'>
                                        <Field
                                          name={`examples[${index}].inputs[${inputIndex}].name`}
                                          placeholder="Input Name"
                                          className="flex-1 p-2 border rounded-lg"
                                        />
                                        <ErrorMessage
                                          name={`examples[${index}].inputs[${inputIndex}].name`}
                                          component="div"
                                          className="text-sm italic text-red-500"
                                        />
                                      </div>
                                      <div>
                                        <Field
                                          name={`examples[${index}].inputs[${inputIndex}].value`}
                                          placeholder="Input Value"
                                          className="flex-1 p-2 border rounded-lg"
                                        />
                                        <ErrorMessage
                                          name={`examples[${index}].inputs[${inputIndex}].value`}
                                          component="div"
                                          className="text-sm italic text-red-500"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeInput(inputIndex)}
                                        className="text-sm text-red-500"
                                      >
                                        - Remove Input
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      pushInput({ name: "", value: "" })
                                    }
                                    className="mt-2 font-bold text-blue-500"
                                  >
                                    + Add Input
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                          </div>
                          {/* output */}
                          <div>
                            <label className="block text-sm font-medium">Output</label>
                            <Field
                              name={`examples[${index}].output`}
                              placeholder="Example Code"
                              className="w-full p-2 border rounded-lg"
                            />
                            <ErrorMessage
                              name={`examples[${index}].output`}
                              component="div"
                              className="text-sm italic text-red-500"
                            />
                          </div>

                          {/* Explanation */}
                          <div>
                            <label className="block text-sm font-medium">Explanation</label>
                            <Field
                              name={`examples[${index}].explanation`}
                              placeholder="Example Code"
                              className="w-full p-2 border rounded-lg"
                            />
                            <ErrorMessage
                              name={`examples[${index}].explanation`}
                              component="div"
                              className="text-sm italic text-red-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-sm text-red-500"
                          >
                            - Remove Example
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push({ description: '', code: '' })}
                        className="mt-4 font-bold text-green-500"
                      >
                        +Add Example
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Hints Section */}
              <div>
                <h2 className="mb-2 font-semibold text-md">Hints</h2>
                <FieldArray name="hints">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.hints.map((hint, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <ErrorMessage
                            name={`hints.${index}.content`}
                            component="div"
                            className="text-sm italic text-red-500"
                          />
                          <Field
                            name={`hints.${index}.content`}
                            placeholder="Hint"
                            className="w-full p-2 border rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-sm text-red-500"
                          >
                            - Remove Hint
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push('')}
                        className="mt-4 font-bold text-green-500"
                      >
                        +Add Hint
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Submit Button */}
              <div className='flex justify-end'>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg bg-themeColor"
                >
                  Save Changes
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditProblemForm;
