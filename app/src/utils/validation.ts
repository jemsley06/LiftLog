/**
 * Input validation helpers for workout logging.
 */

export function isValidWeight(weight: number): boolean {
  return typeof weight === "number" && weight > 0 && weight <= 2000;
}

export function isValidReps(reps: number): boolean {
  return typeof reps === "number" && Number.isInteger(reps) && reps > 0 && reps <= 100;
}

export function isValidRPE(rpe: number | null | undefined): boolean {
  if (rpe === null || rpe === undefined) return true; // RPE is optional
  return typeof rpe === "number" && rpe >= 1 && rpe <= 10;
}

export function isValidUsername(username: string): boolean {
  if (!username || username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_]+$/.test(username);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6;
}

export function isValidExerciseName(name: string): boolean {
  return typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 50;
}

export function isValidWorkoutName(name: string): boolean {
  if (!name) return true; // Name is optional
  return name.trim().length <= 50;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSetInput(weight: number, reps: number, rpe?: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!isValidWeight(weight)) {
    errors.push({ field: "weight", message: "Weight must be between 0 and 2000" });
  }
  if (!isValidReps(reps)) {
    errors.push({ field: "reps", message: "Reps must be between 1 and 100" });
  }
  if (rpe !== undefined && !isValidRPE(rpe)) {
    errors.push({ field: "rpe", message: "RPE must be between 1 and 10" });
  }
  return errors;
}

export function validateSignUp(
  email: string,
  password: string,
  username: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }
  if (!isValidPassword(password)) {
    errors.push({ field: "password", message: "Password must be at least 6 characters" });
  }
  if (!isValidUsername(username)) {
    errors.push({
      field: "username",
      message: "Username must be 3-20 characters (letters, numbers, underscores)",
    });
  }
  return errors;
}
