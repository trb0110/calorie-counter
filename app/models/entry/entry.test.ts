import { EntryModel } from "./entry"

test("can be created", () => {
  const instance = EntryModel.create({
    id: 1,
    name: "Rick Sanchez",
  })

  expect(instance).toBeTruthy()
})
