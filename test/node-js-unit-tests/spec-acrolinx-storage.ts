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
