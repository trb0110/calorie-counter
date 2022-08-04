import { EntryStoreModel } from "./entry-store"

test("can be created", () => {
  const instance = EntryStoreModel.create({})

  expect(instance).toBeTruthy()
})
