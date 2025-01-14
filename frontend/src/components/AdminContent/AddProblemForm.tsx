import React, { useState } from "react";
import {
  Formik,
  Form,
  Field,
  FieldArray,
  ErrorMessage,
  FormikHelpers,
} from "formik";
import { problemFormValidation } from "../../utils/validation";
import { APIError, ProblemFormFields } from "../../types/types";
import { useAddProblemsMutation } from "../../services/adminApiSlice";
import { Toaster, toast } from "sonner";

const AddProblemForm: React.FC = () => {
  const [tagDropDown, setTagDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addProblem] = useAddProblemsMutation();

  const tags = [
    "Array",
    "String",
    "HashTable",
    "Math",
    "Sort",
    "LinkedList",
    "BST",
    "BinarySearch",
  ];

  const filterTags = tags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropDown = () => {
    setTagDropDown(!tagDropDown);
  };

  const initialValues: ProblemFormFields = {
    slno: 0,
    title: "",
    description: "",
    difficulty: "Select difficulty",
    tags: [],
    testCases: [{
      inputs: [{ name: '', value: '' }],
      output: ''
    }],
    hints: [{ content: "" }],
    examples: [
      {
        heading: "Example 1",
        inputs: [{ name: '', value: '' }],
        output: "",
        explanation: "",
      },
    ],
  };

  const handleSubmit = async (
    values: ProblemFormFields,
    { resetForm }: FormikHelpers<ProblemFormFields>
  ) => {
    try {
      const response = await addProblem({ problemDetails: values }).unwrap();
      if (response) {
        toast.success(response.data);
        resetForm();
      }
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      }
    }
  };

  return (
    <div className="flex items-start justify-center w-full min-h-screen xl:mr-10">
      <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#D8D8FD" } }}
        richColors
      />
      <div className="w-full border rounded-lg shadow-inner bg-customGrey">
        <div className="p-4">
          <div className="text-2xl font-medium bg-blue-500 rounded-lg text-themeColor bg-clip-text clone">
            <h1>Add Problems</h1>
          </div>
          <Formik
            initialValues={initialValues}
            validationSchema={problemFormValidation}
            validateOnMount={true}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="mt-8">
                  <div className="p-4 border rounded-md">
                    <div className="grid grid-cols-1">

                      {/* TITLE SECTION */}
                      <label
                        htmlFor="title"
                        className="block mb-1 text-themeColor"
                      >
                        Title:
                      </label>
                      <div>
                        <Field
                          type="text"
                          name="title"
                          className="w-full px-3 py-2 mb-2 text-base italic text-gray-700 border rounded-md"
                          placeholder="problem title"
                        />
                        <ErrorMessage
                          name="title"
                          component="div"
                          className="text-sm italic text-red-500"
                        />
                      </div>
                    </div>

                    {/* DESCRIPTION SECTION */}
                    <div className="grid grid-cols-1 mt-4">
                      <label
                        htmlFor="description"
                        className="block mb-1 text-themeColor"
                      >
                        Description:
                      </label>
                      <div>
                        <Field
                          as="textarea"
                          name="description"
                          className="w-full px-3 py-2 mb-2 text-base italic text-gray-700 border rounded-md"
                          placeholder="problem description"
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-sm italic text-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* QUESTION NUMBER SECTION */}
                  <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="slno"
                        className="block mb-1 text-themeColor"
                      >
                        Slno:
                      </label>
                      <div className="p-4 border rounded-md">
                        <Field
                          type="number"
                          name="slno"
                          className="w-full px-3 py-2 mb-2 text-base italic text-gray-700 border rounded-md"
                          placeholder="problem number"
                        />
                        <ErrorMessage
                          name="slno"
                          component="div"
                          className="text-sm italic text-red-500"
                        />
                      </div>
                    </div>

                    {/* TAG SECTIONS */}
                    <div className="relative inline-block w-full">
                      <label
                        htmlFor="tags"
                        className="block mb-1 text-themeColor"
                      >
                        Tags:
                      </label>
                      <div className="p-4 border">
                        <button
                          type="button"
                          onClick={toggleDropDown}
                          className="flex items-center w-full px-3 py-2 text-base italic text-gray-500 bg-white rounded-md"
                        >
                          <span>
                            {values.tags.length > 0
                              ? `Tags: ${values.tags.join(", ")}`
                              : "Select Tags"}
                          </span>
                          <span>{tagDropDown ? "▴" : "▾"}</span>
                        </button>
                        <div className="mt-2">
                          <ErrorMessage
                            name="tags"
                            component="div"
                            className="text-sm italic text-red-500 "
                          />
                        </div>
                      </div>
                      {tagDropDown && (
                        <div className="absolute z-10 w-full p-4 mt-2 overflow-y-auto border rounded-md shadow-lg bg-customGrey max-h-64">
                          <input
                            type="text"
                            placeholder="search tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 mb-3 text-base italic text-gray-500 border rounded-md"
                          />
                          <div className="p-4 border rounded-md bg-customGrey">
                            {filterTags.map((tag) => (
                              <>
                                <div
                                  key={tag}
                                  className="flex items-center mb-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={tag}
                                    checked={values.tags.includes(tag)}
                                    onChange={(e) => {
                                      const updatedTags = e.target.checked
                                        ? [...values.tags, tag] // If checkbox is checked, add the tag
                                        : values.tags.filter((t) => t !== tag); // If checkbox is unchecked, remove the tag
                                      setFieldValue("tags", updatedTags);
                                    }}
                                    className="w-5 h-5 text-gray-500 bg-gray-700 border-gray-500 rounded form-checkbox focus:ring-0"
                                  />
                                  <label
                                    htmlFor={tag}
                                    className="ml-2 italic text-gray-700"
                                  >
                                    {tag}
                                  </label>
                                </div>
                              </>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TESTCASES SECTION */}
                  <div className="grid grid-cols-1 gap-4 mt-4 ">
                    <div>
                      <label
                        htmlFor="testCases"
                        className="block mb-1 text-themeColor"
                      >
                        Test Cases:
                      </label>
                      <FieldArray name="testCases">
                        {({ push, remove }) => (
                          <div>
                            {values.testCases.map((testCase, testCaseIndex) => (
                              <div
                                key={testCaseIndex}
                                className="p-4 mb-2 border rounded-md"
                              >
                                {/* Dynamic Inputs for Test Case */}
                                <FieldArray name={`testCases.${testCaseIndex}.inputs`}>
                                  {({ push: pushInput, remove: removeInput }) => (
                                    <div>
                                      {testCase.inputs.map((input, inputIndex) => (
                                        <div
                                          key={inputIndex}
                                          className="flex items-center mb-2 space-x-2"
                                        >
                                          <div className="w-full">
                                            <Field
                                              name={`testCases.${testCaseIndex}.inputs.${inputIndex}.name`}
                                              placeholder="Input Name"
                                              className="block w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                                            />
                                            <ErrorMessage
                                              name={`testCases.${testCaseIndex}.inputs.${inputIndex}.name`}
                                              component="div"
                                              className="text-sm italic text-red-500"
                                            />
                                          </div>
                                          <div className="w-full">
                                            <Field
                                              name={`testCases.${testCaseIndex}.inputs.${inputIndex}.value`}
                                              placeholder="Input Value"
                                              className="block w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                                            />
                                            <ErrorMessage
                                              name={`testCases.${testCaseIndex}.inputs.${inputIndex}.value`}
                                              component="div"
                                              className="text-sm italic text-red-500"
                                            />
                                          </div>
                                          {testCase.inputs.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeInput(inputIndex)}
                                              className="text-red-500"
                                            >
                                              Remove
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => pushInput({ name: '', value: '' })}
                                        className="mb-2 text-sm text-indigo-700"
                                      >
                                        Add Another Input
                                      </button>
                                    </div>
                                  )}
                                </FieldArray>

                                {/* Output for Test Case */}
                                <div className="mt-2">
                                  <Field
                                    type="text"
                                    name={`testCases.${testCaseIndex}.output`}
                                    placeholder="Test Case Output"
                                    className="block w-full px-3 py-2 text-base italic text-gray-500 border rounded-md"
                                  />
                                  <ErrorMessage
                                    name={`testCases.${testCaseIndex}.output`}
                                    component="div"
                                    className="text-sm italic text-red-500"
                                  />
                                </div>

                                {/* Remove Test Case Button */}
                                {values.testCases.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(testCaseIndex)}
                                    className="mt-2 text-red-500"
                                  >
                                    Remove Test Case
                                  </button>
                                )}
                              </div>
                            ))}

                            {/* Add Test Case Button */}
                            <button
                              type="button"
                              onClick={() => push({
                                inputs: [{ name: '', value: '' }],
                                output: ''
                              })}
                              className="text-sm text-indigo-700"
                            >
                              Add Test Case
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  </div>

                  {/* DIFFICULTY SECTIONS */}
                  <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                    <div>
                      <div>
                        <label
                          htmlFor="tags"
                          className="block mb-1 text-themeColor"
                        >
                          Difficulty:
                        </label>
                        <div className="p-4 mt-1 border rounded-md">
                          <Field
                            as="select"
                            id="difficulty"
                            name="difficulty"
                            className="w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                          >
                            <option value="Difficulty">
                              Select difficulty
                            </option>
                            <option className="text-green-600" value="easy">
                              Easy
                            </option>
                            <option className="text-yellow-500" value="medium">
                              Medium
                            </option>
                            <option className="text-red-500" value="hard">
                              Hard
                            </option>
                          </Field>
                          <ErrorMessage
                            name="difficulty"
                            component="div"
                            className="text-sm italic text-red-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* HINT SECTIONS */}
                    <div>
                      <label
                        htmlFor="hints"
                        className="block mb-1 text-themeColor"
                      >
                        Hints: (*optional)
                      </label>
                      <FieldArray name="hints">
                        {({ push, remove }) => (
                          <div>
                            {values.hints.map((hint, index: number) => (
                              <div
                                key={index}
                                className="p-4 mt-1 border rounded-md"
                              >
                                <Field
                                  name={`hints.${index}.content`}
                                  placeholder="Hint content"
                                  className="w-full px-3 py-2 mb-2 italic border-gray-300 rounded-md shadow-sm"
                                />
                                {values.hints.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="italic text-red-500"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push({ content: "" })}
                              className="inline-flex items-center ml-2 text-sm font-medium leading-4 text-indigo-700 hover:text-indigo-500"
                            >
                              Add Hint
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>

                  </div>




                  <div className="grid grid-cols-1 mt-4">
                    <label
                      htmlFor="examples"
                      className="block mb-1 text-themeColor"
                    >
                      Examples:
                    </label>
                    <FieldArray name="examples">
                {({ push, remove }) => (
                  <div>
                    {values.examples.map((example, exampleIndex) => (
                      <div 
                        key={exampleIndex} 
                        className="p-4 mb-2 border rounded-md"
                      >
                        {/* Heading */}
                        <Field
                          name={`examples.${exampleIndex}.heading`}
                          placeholder="Example Heading"
                          className="block w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                        />
                        <ErrorMessage
                          name={`examples.${exampleIndex}.heading`}
                          component="div"
                          className="text-sm italic text-red-500"
                        />

                        {/* Dynamic Inputs for Example */}
                        <FieldArray name={`examples.${exampleIndex}.inputs`}>
                          {({ push: pushInput, remove: removeInput }) => (
                            <div>
                              {example.inputs.map((input, inputIndex) => (
                                <div 
                                  key={inputIndex} 
                                  className="flex items-center mb-2 space-x-2"
                                >
                                  <div className="w-full">
                                    <Field
                                      name={`examples.${exampleIndex}.inputs.${inputIndex}.name`}
                                      placeholder="Input Name"
                                      className="block w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                                    />
                                    <ErrorMessage
                                      name={`examples.${exampleIndex}.inputs.${inputIndex}.name`}
                                      component="div"
                                      className="text-sm italic text-red-500"
                                    />
                                  </div>
                                  <div className="w-full">
                                    <Field
                                      name={`examples.${exampleIndex}.inputs.${inputIndex}.value`}
                                      placeholder="Input Value"
                                      className="block w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                                    />
                                    <ErrorMessage
                                      name={`examples.${exampleIndex}.inputs.${inputIndex}.value`}
                                      component="div"
                                      className="text-sm italic text-red-500"
                                    />
                                  </div>
                                  {example.inputs.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeInput(inputIndex)}
                                      className="text-red-500"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => pushInput({ name: '', value: '' })}
                                className="mb-2 text-sm text-indigo-700"
                              >
                                Add Another Input
                              </button>
                            </div>
                          )}
                        </FieldArray>

                        {/* Output and Explanation */}
                        <div className="mt-2">
                          <Field
                            name={`examples.${exampleIndex}.output`}
                            placeholder="Example Output"
                            className="block w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                          />
                          <ErrorMessage
                            name={`examples.${exampleIndex}.output`}
                            component="div"
                            className="text-sm italic text-red-500"
                          />

                          <Field
                            name={`examples.${exampleIndex}.explanation`}
                            placeholder="Example Explanation"
                            className="block w-full px-3 py-2 mb-2 text-base italic text-gray-500 border rounded-md"
                          />
                          <ErrorMessage
                            name={`examples.${exampleIndex}.explanation`}
                            component="div"
                            className="text-sm italic text-red-500"
                          />
                        </div>

                        {/* Remove Example Button */}
                        {values.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(exampleIndex)}
                            className="mt-2 text-red-500"
                          >
                            Remove Example
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Example Button */}
                    <button
                      type="button"
                      onClick={() => push({
                        heading: '',
                        inputs: [{ name: '', value: '' }],
                        output: '',
                        explanation: ''
                      })}
                      className="text-sm text-indigo-700"
                    >
                      Add Example
                    </button>
                  </div>
                )}
              </FieldArray>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddProblemForm;
