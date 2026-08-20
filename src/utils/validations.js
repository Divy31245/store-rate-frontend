import * as yup from 'yup';

export const loginValidationSchema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .required('Password is required'),
});

export const registerValidationSchema = yup.object().shape({
  name: yup
    .string()
    .min(20, 'Name must be between 20 and 60 characters')
    .max(60, 'Name must be between 20 and 60 characters')
    .required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character')
    .required('Password is required'),
  address: yup.string().max(400, 'Address is too long').required('Address is required'),
});
