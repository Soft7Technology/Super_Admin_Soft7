/**
 * Centralized credit amount validation utility.
 * Enforces strict boundary checks for wallet credit transactions on both client and server.
 */

export interface CreditValidationResult {
  isValid: boolean;
  amount: number;
  error: string | null;
}

export const MAX_CREDIT_AMOUNT = 1000000000; // ₹1,00,00,00,000 (100 Crore upper bound for safety)

/**
 * Validates a credit amount before any wallet balance modification.
 * Rejects negative numbers (-500, -1, -0.01), zero, NaN, Infinity, empty strings,
 * non-numeric values, and numbers with more than 2 decimal places.
 */
export function validateCreditAmount(rawAmount: unknown): CreditValidationResult {
  // Reject null or undefined
  if (rawAmount === null || rawAmount === undefined) {
    return { isValid: false, amount: 0, error: "Credit amount is required." };
  }

  // If already a number
  if (typeof rawAmount === "number") {
    if (isNaN(rawAmount) || !Number.isFinite(rawAmount)) {
      return { isValid: false, amount: 0, error: "Please enter a valid finite number." };
    }

    if (rawAmount <= 0) {
      return { isValid: false, amount: 0, error: "Credit amount must be greater than 0." };
    }

    if (rawAmount > MAX_CREDIT_AMOUNT) {
      return {
        isValid: false,
        amount: 0,
        error: `Credit amount cannot exceed ₹${MAX_CREDIT_AMOUNT.toLocaleString("en-IN")}.`,
      };
    }

    // Check decimal places: allow maximum 2 decimal places (e.g. paisa)
    const str = rawAmount.toString();
    const parts = str.split(".");
    if (parts.length === 2 && parts[1].length > 2) {
      return {
        isValid: false,
        amount: 0,
        error: "Credit amount cannot have more than 2 decimal places.",
      };
    }

    return { isValid: true, amount: rawAmount, error: null };
  }

  // If string
  const strVal = String(rawAmount).trim();
  if (!strVal) {
    return { isValid: false, amount: 0, error: "Credit amount is required." };
  }

  // Reject negative numbers explicitly
  if (strVal.startsWith("-") || strVal.includes("-")) {
    return { isValid: false, amount: 0, error: "Credit amount must be greater than 0." };
  }

  // Check valid numeric pattern (positive integers or decimals)
  if (!/^\d+(\.\d+)?$/.test(strVal)) {
    return { isValid: false, amount: 0, error: "Please enter a valid numeric credit amount." };
  }

  const numAmount = Number(strVal);

  if (isNaN(numAmount) || !Number.isFinite(numAmount)) {
    return { isValid: false, amount: 0, error: "Please enter a valid finite number." };
  }

  if (numAmount <= 0) {
    return { isValid: false, amount: 0, error: "Credit amount must be greater than 0." };
  }

  // Check decimal places
  const decimalParts = strVal.split(".");
  if (decimalParts.length === 2 && decimalParts[1].length > 2) {
    return {
      isValid: false,
      amount: 0,
      error: "Credit amount cannot have more than 2 decimal places.",
    };
  }

  if (numAmount > MAX_CREDIT_AMOUNT) {
    return {
      isValid: false,
      amount: 0,
      error: `Credit amount cannot exceed ₹${MAX_CREDIT_AMOUNT.toLocaleString("en-IN")}.`,
    };
  }

  return { isValid: true, amount: numAmount, error: null };
}
