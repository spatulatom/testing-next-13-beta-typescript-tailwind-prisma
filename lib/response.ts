/**
 * Server Action Response Types
 * Provides consistent, type-safe response contracts for all Server Actions
 */

/**
 * Success response with data payload
 */
export type SuccessResponse<T> = {
  success: true;
  data: T;
};

/**
 * Error response with error message
 */
export type ErrorResponse = {
  success: false;
  error: string;
};

/**
 * Discriminated union for Server Action responses
 * Usage: ResponseType<YourDataType>
 *
 * @example
 * export async function myAction(): Promise<ResponseType<PostType>> {
 *   try {
 *     const data = await prisma.post.findUnique(...);
 *     return { success: true, data };
 *   } catch (error) {
 *     return { success: false, error: 'Failed to fetch post' };
 *   }
 * }
 */
export type ResponseType<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Helper to create a success response
 */
export function successResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}

/**
 * Helper to create an error response
 */
export function errorResponse(error: string): ErrorResponse {
  return { success: false, error };
}

/**
 * Type guard to check if response is successful
 */
export function isSuccess<T>(
  response: ResponseType<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isError<T>(
  response: ResponseType<T>
): response is ErrorResponse {
  return response.success === false;
}
