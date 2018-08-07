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

import {
  AcrolinxSimpleStorage,
  AcrolinxSimpleStorageInMemory,
  forTesting
} from "../../src/utils/acrolinx-storage";
import {assert} from "chai";


describe('acrolinx-storage', () => {
  describe('getAcrolinxSimpleStorageAtInitInternal', () => {
    it('use acrolinxStorage if available', () => {
      const dummyAcrolinxStorage = {} as AcrolinxSimpleStorage;
      const storage = forTesting.getAcrolinxSimpleStorageAtInitInternal(dummyAcrolinxStorage, undefined);
      assert.equal(storage, dummyAcrolinxStorage);
    });

    it('if no acrolinxStorage then try localStorage', () => {
      const localStorageDummy = new AcrolinxSimpleStorageInMemory();
      const storage = forTesting.getAcrolinxSimpleStorageAtInitInternal(undefined, localStorageDummy as any as Storage);
      assert.equal(storage, localStorageDummy);
    });

    it('no acrolinxStorage and no localStorage => Store in memory', () => {
      const storage = forTesting.getAcrolinxSimpleStorageAtInitInternal(undefined, undefined);
      assert.instanceOf(storage, AcrolinxSimpleStorageInMemory);
    });
  });

});
