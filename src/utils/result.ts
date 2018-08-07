/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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