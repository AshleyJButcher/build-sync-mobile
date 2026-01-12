/**
 * Email validation regex pattern
 * Validates common email formats while still being reasonable
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password requirements
 */
const PASSWORD_MIN_LENGTH = 8;

/**
 * Validates an email address
 * @param email The email address to validate
 * @returns An object containing a valid flag and optional error message
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (email == null || email.trim() === '') {
    return {
      valid: false,
      error: 'Email is required',
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { valid: true };
}

/**
 * Validates a password
 * @param password The password to validate
 * @returns An object containing a valid flag and optional error message
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password == null || password === '') {
    return {
      valid: false,
      error: 'Password is required',
    };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validates that two passwords match
 * @param password Original password
 * @param confirmPassword Confirmation password
 * @returns An object containing a valid flag and optional error message
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return {
      valid: false,
      error: 'Passwords do not match',
    };
  }

  return { valid: true };
}

/**
 * Validates a name
 * @param name The name to validate
 * @returns An object containing a valid flag and optional error message
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (name == null || name.trim() === '') {
    return {
      valid: false,
      error: 'Name is required',
    };
  }

  return { valid: true };
}

/**
 * Validates the login form
 * @param email Email address
 * @param password Password
 * @returns An object containing a valid flag and optional error message
 */
export function validateLoginForm(
  email: string,
  password: string
): { valid: boolean; error?: string } {
  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    return emailResult;
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return passwordResult;
  }

  return { valid: true };
}

/**
 * Validates the registration form
 * @param name User's name
 * @param email Email address
 * @param password Password
 * @param confirmPassword Password confirmation
 * @returns An object containing a valid flag and optional error message
 */
export function validateRegistrationForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  const nameResult = validateName(name);
  if (!nameResult.valid) {
    return nameResult;
  }

  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    return emailResult;
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return passwordResult;
  }

  const passwordMatchResult = validatePasswordMatch(password, confirmPassword);
  if (!passwordMatchResult.valid) {
    return passwordMatchResult;
  }

  return { valid: true };
}
