/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Unconditionally fails, throwing an Error with the given message.
 * Messages are stripped in production builds.
 *
 * Returns `never` and can be used in expressions:
 * @example
 * let futureVar = fail('not implemented yet');
 *
 * @param code generate a new unique value with `yarn assertion-id:generate`
 * Search for an existing value using `yarn assertion-id:find X`
 */
export declare function fail(code: number, message: string, context?: Record<string, unknown>): never;
/**
 * Unconditionally fails, throwing an Error with the given message.
 * Messages are stripped in production builds.
 *
 * Returns `never` and can be used in expressions:
 * @example
 * let futureVar = fail('not implemented yet');
 *
 * @param id generate a new unique value with `yarn assertion-id:generate`
 * Search for an existing value using `yarn assertion-id:find X`
 */
export declare function fail(id: number, context?: Record<string, unknown>): never;
/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * Messages are stripped in production builds.
 *
 * @param id generate a new unique value with `yarn assertion-idgenerate`.
 * Search for an existing value using `yarn assertion-id:find X`
 */
export declare function hardAssert(assertion: boolean, id: number, message: string, context?: Record<string, unknown>): asserts assertion;
/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * Messages are stripped in production builds.
 *
 * @param id generate a new unique value with `yarn assertion-id:generate`.
 * Search for an existing value using `yarn assertion-id:find X`
 */
export declare function hardAssert(assertion: boolean, id: number, context?: Record<string, unknown>): asserts assertion;
/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 *
 * The code of callsites invoking this function are stripped out in production
 * builds. Any side-effects of code within the debugAssert() invocation will not
 * happen in this case.
 *
 * @internal
 */
export declare function debugAssert(assertion: boolean, message: string): asserts assertion;
/**
 * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
 * instance of `T` before casting.
 */
export declare function debugCast<T>(obj: object, constructor: {
    new (...args: any[]): T;
}): T | never;
