import { ValidationError } from "yup";

export const formatYupError = (error: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = [];

  error.inner.forEach(err => {
    errors.push({ path: err.path, message: err.message });
  });

  return errors;
};
