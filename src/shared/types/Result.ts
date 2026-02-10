/**
 * Result Type
 * Functional error handling - Either<Success, Error>
 *
 * Based on Rust's Result and Haskell's Either
 * Avoids throwing exceptions for expected errors
 */

export abstract class Result<T, E> {
  abstract isSuccess(): boolean;
  abstract isFailure(): boolean;
  abstract getValueOrThrow(): T;
  abstract getErrorOrThrow(): E;
  abstract map<U>(fn: (value: T) => U): Result<U, E>;
  abstract mapError<F>(fn: (error: E) => F): Result<T, F>;
  abstract flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  abstract fold<U>(onSuccess: (value: T) => U, onError: (error: E) => U): U;
}

export class Success<T, E> extends Result<T, E> {
  constructor(private readonly value: T) {
    super();
  }

  isSuccess(): boolean {
    return true;
  }

  isFailure(): boolean {
    return false;
  }

  getValueOrThrow(): T {
    return this.value;
  }

  getErrorOrThrow(): E {
    throw new Error('Called getErrorOrThrow on a Success result');
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Success(fn(this.value));
  }

  mapError<F>(_fn: (error: E) => F): Result<T, F> {
    return new Success(this.value) as any;
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  fold<U>(onSuccess: (value: T) => U, _onError: (error: E) => U): U {
    return onSuccess(this.value);
  }
}

export class Failure<T, E> extends Result<T, E> {
  constructor(private readonly error: E) {
    super();
  }

  isSuccess(): boolean {
    return false;
  }

  isFailure(): boolean {
    return true;
  }

  getValueOrThrow(): T {
    throw new Error('Called getValueOrThrow on a Failure result');
  }

  getErrorOrThrow(): E {
    return this.error;
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Failure(this.error);
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    return new Failure(fn(this.error));
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Failure(this.error);
  }

  fold<U>(_onSuccess: (value: T) => U, onError: (error: E) => U): U {
    return onError(this.error);
  }
}

/**
 * Helper functions
 */
export const Ok = <T, E = never>(value: T): Result<T, E> => {
  return new Success(value);
};

export const Err = <E, T = never>(error: E): Result<T, E> => {
  return new Failure(error);
};

/**
 * Combine multiple results
 */
export const combine = <T, E>(
  results: Result<T, E>[]
): Result<T[], E> => {
  const values: T[] = [];

  for (const result of results) {
    if (result.isFailure()) {
      return result as Result<T[], E>;
    }
    values.push(result.getValueOrThrow());
  }

  return Ok(values);
};
