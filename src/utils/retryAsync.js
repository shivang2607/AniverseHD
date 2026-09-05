/**
 * Retries an async operation up to `retries` times.
 *
 * Deliberately minimal — see PR discussion for known limitations
 * (no backoff, original error not preserved on final failure).
 */
export default async function retryAsync(operation, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Operation failed after ${retries + 1} attempts`);
}
