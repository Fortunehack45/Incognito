// A 'satisfies' operator would be useful here, but it's not available in all TS versions.
// We can use a helper function to enforce the type.
function createSecurityRuleContext<T extends SecurityRuleContext>(context: T): T {
  return context;
}

/**
 * Represents the context of a Firestore Security Rule denial.
 * This information is used to construct a detailed error message for debugging.
 */
export type SecurityRuleContext = {
  /** The Firestore path that was accessed, e.g., 'users/userId'. */
  path: string;
  /** The operation that was denied. */
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  /**
   * The data that was being sent to the server for 'create' or 'update' operations.
   * This is equivalent to `request.resource.data` in Security Rules.
   */
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission errors.
 * It formats a detailed error message that helps developers debug Security Rules.
 */
export class FirestorePermissionError extends Error {
  /**
   * Creates an instance of FirestorePermissionError.
   * @param context - The context of the security rule denial.
   */
  constructor(context: SecurityRuleContext) {
    const message = `
FirestoreError: Missing or insufficient permissions.
The following request was denied by Firestore Security Rules:
${JSON.stringify(createSecurityRuleContext(context), null, 2)}
`;
    super(message);
    this.name = 'FirestorePermissionError';

    // This is to make the error visible in the Next.js development overlay
    // by adding a digest. This was the source of the build error and has been removed.

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
