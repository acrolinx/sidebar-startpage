export interface ResultMatcher<T, E = Error, MR = void> {
  ok: (okValue: T) => MR;
  err: (error: E) => MR;
}

export interface Result<T, E = Error> {
  match<MR>(matcher: ResultMatcher<T, E, MR>): MR;
}

export class Ok<T, E> implements Result<T, E> {
  constructor(private value: T) {
  }

  match<MR>(matcher: ResultMatcher<T, E, MR>): MR {
    return matcher.ok(this.value);
  }
}

export class Err<T, E> implements Result<T, E> {
  constructor(private error: E) {
  }

  match<MR>(matcher: ResultMatcher<T, E, MR>): MR {
    return matcher.err(this.error);
  }
}

export function ok<T, E>(value: T): Ok<T, E> {
  return new Ok(value);
}

export function err<T, E>(error: E): Err<T, E> {
  return new Err(error);
}