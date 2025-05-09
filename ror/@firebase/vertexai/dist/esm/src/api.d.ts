/**
 * @license
 * Copyright 2024 Google LLC
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
import { FirebaseApp } from '@firebase/app';
import { VERTEX_TYPE } from './constants';
import { VertexAIService } from './service';
import { VertexAI, VertexAIOptions } from './public-types';
import { ImagenModelParams, ModelParams, RequestOptions } from './types';
import { VertexAIError } from './errors';
import { VertexAIModel, GenerativeModel, ImagenModel } from './models';
export { ChatSession } from './methods/chat-session';
export * from './requests/schema-builder';
export { ImagenImageFormat } from './requests/imagen-image-format';
export { VertexAIModel, GenerativeModel, ImagenModel };
export { VertexAIError };
declare module '@firebase/component' {
    interface NameServiceMapping {
        [VERTEX_TYPE]: VertexAIService;
    }
}
/**
 * Returns a <code>{@link VertexAI}</code> instance for the given app.
 *
 * @public
 *
 * @param app - The {@link @firebase/app#FirebaseApp} to use.
 */
export declare function getVertexAI(app?: FirebaseApp, options?: VertexAIOptions): VertexAI;
/**
 * Returns a <code>{@link GenerativeModel}</code> class with methods for inference
 * and other functionality.
 *
 * @public
 */
export declare function getGenerativeModel(vertexAI: VertexAI, modelParams: ModelParams, requestOptions?: RequestOptions): GenerativeModel;
/**
 * Returns an <code>{@link ImagenModel}</code> class with methods for using Imagen.
 *
 * Only Imagen 3 models (named `imagen-3.0-*`) are supported.
 *
 * @param vertexAI - An instance of the Vertex AI in Firebase SDK.
 * @param modelParams - Parameters to use when making Imagen requests.
 * @param requestOptions - Additional options to use when making requests.
 *
 * @throws If the `apiKey` or `projectId` fields are missing in your
 * Firebase config.
 *
 * @beta
 */
export declare function getImagenModel(vertexAI: VertexAI, modelParams: ImagenModelParams, requestOptions?: RequestOptions): ImagenModel;
