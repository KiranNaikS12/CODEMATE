import * as Yup from "yup";

const userNameRegex = /^[a-zA-Z]+$/;
const characterRegex = /^[a-zA-Z\s,-]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
const ageRegex = /^(0?[0-9]|[1-9][0-9])$/;
const phoneRegex = /^(?!.*(\d)\1{6})\d{10}$/;

// auth validation 
export const baseValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .matches(
      passwordRegex,
      "Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
});


export const registrationValidationSchema = baseValidationSchema.shape({
  username: Yup.string()
    .matches(userNameRegex, "Username should only contain letters")
    .required("Username is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Confirm Password does not match")
    .required("Confirm Password is required"),
});


export const resetPasswordValidationScheama = Yup.object({
  password: Yup.string()
    .matches(
      passwordRegex,
      "Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Confirm Password does not match")
    .required("Confirm Password is required"),
})

export const adminValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
})




// Tutor approval form validation 
export const tutorApprovalFormValidationSchema = Yup.object({
  fullname: Yup.string()
    .matches(characterRegex, "Username should only contain letters")
    .required("fullname required"),
  age: Yup.string()
    .matches(ageRegex, "Please enter a valid age")
    .required("age is required"),
  country: Yup.string()
    .matches(userNameRegex, "country should only contain letters")
    .required('country required'),
  contact: Yup.string()
    .matches(phoneRegex, "Invalid phone number")
    .required('phone number is required'),
  birthday: Yup.string()
    .required('date of birth required'),
  specialization: Yup.string()
    .matches(characterRegex, "subject should only contain letter")
    .required('specialization is required'),
  education: Yup.string()
    .required('education is required'),
  experience: Yup.string()
    .matches(ageRegex, 'Invalid years of experience')
    .required('experience is required'),
  certificate: Yup.mixed<File>()
    .required('certificate is required')
    .test("fileType", "Uploaded file must be a PDF", (value) => {
      return value && value.type === "application/pdf";
    })
    .test("fileSize", "Uploaded file is too large (max: 2MB)", (value) => {
      return value && value.size <= 2 * 1024 * 1024;
    })
})



// UserProfile-validation
export const profileValidationSchema = Yup.object().shape({
  fullname: Yup.string().matches(characterRegex, 'Invalid! FullName should not contain digits'),
  country: Yup.string().matches(characterRegex, 'Invalid country name'),
  birthday: Yup.date().max(new Date(), 'Date of birth must be in the past'),
  website: Yup.string().url("URl must be valid"),
  work: Yup.string().matches(characterRegex, 'Invalid! Avoid digits'),
  education: Yup.string().matches(characterRegex, 'Invalid! Avoid digits'),
  technicalSkills: Yup.string().matches(characterRegex, 'Invalid! Avoid digits'),
});



//tutorProfile-validation
export const tutorProfileValidationSchema = Yup.object().shape({
  fullname: Yup.string().matches(characterRegex, 'Invalid! FullName should not contain digits'),
  age: Yup.number().min(10, 'Age must be at above 10').max(99, 'Age must be below 99').integer('Age must be a whole number'),
  country: Yup.string().matches(characterRegex, 'Invalid country name'),
  dob: Yup.date().max(new Date(), 'Date of birth must be in the past'),
  website: Yup.string().url("URl must be valid"),
  work: Yup.string().matches(characterRegex, 'Invalid! Avoid digits'),
  education: Yup.string().matches(characterRegex, 'Invalid! Avoid digits'),
  technicalSkills: Yup.string().matches(characterRegex, 'Invalid! Avoid digits'),
});


// Problems-validation
export const problemFormValidation = Yup.object({
  slno: Yup.number().required('Problem number is required').positive('Must be valid number'),
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  difficulty: Yup.string().oneOf(['easy', 'medium', 'hard']).required('Please select the difficulty'),
  tags: Yup.array()
    .of(
      Yup.string()
        .oneOf(['Array', 'String', 'Math', 'HashTable', 'Sort', 'LinkedList', 'BST', 'BinarySearch'])
        .required('Please select the tags')
    )
    .min(1, 'Please select at least one tag'),
    testCases: Yup.array().of(
      Yup.object().shape({
        inputs: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required('Input name is required'),
            value: Yup.string().required('Input value is required')
          })
        ).min(1, 'At least one input is required'),
        output: Yup.string().required('Output is required')
      })
    ),
    examples: Yup.array().of(
      Yup.object().shape({
        heading: Yup.string().required('Heading is required'),
        inputs: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required('Input name is required'),
            value: Yup.string().required('Input value is required')
          })
        ).min(1, 'At least one input is required'),
        output: Yup.string().required('Output is required'),
        explanation: Yup.string().required('Explanation is required')
      })
    )
})

//resetPasswordValidation
export const updateValidationPasswordSchema = resetPasswordValidationScheama.shape({
  current_password: Yup.string()
    .matches(
      passwordRegex,
      "Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Current Password is required"),
})


// wallet validation
export const walletValidationSchema = Yup.object({
  amount: Yup.number()
    .required('Please enter the amount')
    .positive('Please enter a valid amount')
});

//review validation
export const reviewSchema = Yup.object({
  title: Yup.string().required('title is required'),
  feedback: Yup.string().required('Feedback is required'),
  ratings: Yup.number()
    .required('Rating is required')
    .min(0.5, 'Please provide stars'),
})

//problem review validation
export const problemReviewSchema = Yup.object({
  reviews: Yup.string().required('Review is required'),
  ratings: Yup.number()
  .required('Rating is required')
  .min(0.5, 'Please provide stars'),
})


//course validation
export const AddCourseValidationSchema = Yup.object({
  title: Yup.string()
    .required('Course title is required')
    .min(10, 'Title must be at least 10 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: Yup.string()
    .required('Course description is required')
    .min(50, 'Description must be at least 50 characters long')
    .max(1000, 'Description cannot exceed 1000 characters'),
  level: Yup.string()
    .required('Course level is required')
    .oneOf(['beginner', 'intermediate', 'advanced'], 'Invalid course level'),
  category: Yup.string()
    .required('Course category is required'),
  lesson: Yup.number()
    .required('Total number of lessons is required')
    .positive('Number of lessons must be a positive number')
    .integer('Number of lessons must be a whole number')
    .max(100, 'Number of lessons cannot exceed 100'),
  language: Yup.string()
    .required('Language is required')
    .min(2, 'Language must be at least 2 characters long')
    .max(50, 'Language cannot exceed 50 characters'),
  subject: Yup.string()
    .required('Subject is required')
    .min(2, 'Subject must be at least 2 characters long')
    .max(50, 'Subject cannot exceed 50 characters'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be a positive number')
    .max(10000, 'Price cannot exceed $10,000'),
  discount: Yup.number()
    .required('Discount is required')
    .max(70, 'Discount cannot exceed more than 70 percentage'),
  coverImage: Yup.mixed()
    .required("Cover image is required")
})

//problme feedback schema

export const feedbackSchema  = Yup.object({
  feedback: Yup.string().required('Feedback is required'),
})


//problem validation for basic updates
export const updateBasicProblemInfoValidationSchema = Yup.object({
  slno: Yup.number().required('Problem number is required').positive('Must be valid number'),
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  difficulty: Yup.string().oneOf(['easy', 'medium', 'hard']).required('Please select the difficulty'),
  
});


export const additionalInfoValidationSchema = Yup.object({
  testCases: Yup.array().of(
    Yup.object().shape({
      inputs: Yup.array().of(
        Yup.object().shape({
          name: Yup.string()
            .trim()
            .required('Input name is required'),
          value: Yup.string()
            .trim()
            .required('Input value is required')
        })
      )
      .min(1, 'At least one input is required'),
      output: Yup.string()
        .trim()
        .required('Output is required')
        .max(500, 'Output must be at most 500 characters')
    })
  )
  .min(1, 'At least one test case is required'),

  hints: Yup.array().of(
    Yup.object().shape({
      content: Yup.string()
        .trim()
        .required('Hint content is required')
        .max(500, 'Hint must be at most 500 characters')
    })
  )
  .min(1, 'At least one hint is required'),


  examples: Yup.array().of(
    Yup.object().shape({
      heading: Yup.string()
        .trim()
        .required('Example heading is required'),
      inputs: Yup.array().of(
        Yup.object().shape({
          name: Yup.string()
            .trim()
            .required('Input name is required')
            .max(50, 'Input name must be at most 50 characters'),
          value: Yup.string()
            .trim()
            .required('Input value is required')
            .max(200, 'Input value must be at most 200 characters')
        })
      )
      .min(1, 'At least one input is required'),
      output: Yup.string()
        .trim()
        .required('Output is required')
        .max(500, 'Output must be at most 500 characters'),
      explanation: Yup.string()
        .trim()
        .required('Explanation is required')
        .max(1000, 'Explanation must be at most 1000 characters')
    })
  )
  .min(1, 'At least one example is required'),
})