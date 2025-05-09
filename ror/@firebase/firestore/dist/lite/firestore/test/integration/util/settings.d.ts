/**
 * @license
 * Copyright 2020 Google LLC
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
import { PrivateSettings } from './firebase_export';
export declare const TARGET_DB_ID: string | '(default)';
export declare const USE_EMULATOR: boolean;
export declare const DEFAULT_SETTINGS: PrivateSettings;
export declare function getEmulatorPort(): number;
export declare const DEFAULT_PROJECT_ID: any;
export declare const ALT_PROJECT_ID = "test-db2";
export declare const COMPOSITE_INDEX_TEST_COLLECTION = "composite-index-test-collection";
