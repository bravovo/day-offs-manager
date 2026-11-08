import * as z from "zod";

// export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const checkEmailValidity = (email: string): boolean => {
  return z.email().validate(email);
};
