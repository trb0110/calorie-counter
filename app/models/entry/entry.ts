import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Rick and Morty character model.
 */
export const EntryModel = types.model("Entry").props({
  CalorieId: types.maybe(types.string),
  UserID: types.maybe(types.string),
  Username: types.maybe(types.string),
  Timestamp: types.maybe(types.string),
  Food: types.maybe(types.string),
  CalorieCount: types.maybe(types.string),
})

type EntryType = Instance<typeof EntryModel>
export interface Entry extends EntryType {}
type EntrySnapshotType = SnapshotOut<typeof EntryModel>
export interface EntrySnapshot extends EntrySnapshotType {}
export const createEntryDefaultModel = () => types.optional(EntryModel, {})
