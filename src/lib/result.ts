/**
 * Result/Either type for explicit error handling.
 *
 * Instead of throwing errors, services return Result<T, E>. This makes error
 * handling visible at the type level and composable without try/catch.
 *
 * @example
 * const result = await postService.createPost(data);
 * if (!result.ok) {
 *   // result.error is typed and guaranteed to be there
 *   return { success: false, error: result.error.message };
 * }
 * // result.value is typed and guaranteed to be there
 * return { success: true, data: result.value };
 */

/**
 * Success variant: contains the successful value.
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Error variant: contains the error.
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Result union type: either success or error, never both.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Create a successful result.
 */
export const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * Create an error result.
 */
export const Err = <E>(error: E): Err<E> => ({ ok: false, error });

/**
 * Map a result's value if successful, otherwise return the error unchanged.
 */
export const map = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
  result.ok ? Ok(fn(result.value)) : result;

/**
 * Flat-map (bind) a result: chain operations that return results.
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => (result.ok ? fn(result.value) : result);

/**
 * Get the value or a default if the result is an error.
 */
export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  result.ok ? result.value : defaultValue;

/**
 * Match on a result: provide handlers for both ok and err cases.
 */
export const match = <T, E, R>(
  result: Result<T, E>,
  onOk: (value: T) => R,
  onErr: (error: E) => R,
): R => (result.ok ? onOk(result.value) : onErr(result.error));

/**
 * Combine multiple results into one: if any fail, return the first error.
 */
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = [];
  for (const result of results) {
    if (!result.ok) return result;
    values.push(result.value);
  }
  return Ok(values);
};
