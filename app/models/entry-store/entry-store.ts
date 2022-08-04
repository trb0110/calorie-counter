import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { EntrySnapshot, EntryModel } from "../entry/entry"
import { EntryApi } from "../../services/api/entry-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Example store containing Rick and Morty characters
 */
export const EntryStoreModel = types
  .model("EntryStore")
  .props({
    entry: types.optional(types.array(EntryModel), []),
  })
  .extend(withEnvironment)
  .actions((self) => ({
    saveEntries: (entrySnapshots: EntrySnapshot[]) => {
      self.entry.replace(entrySnapshots)
    },
  }))
  .actions((self) => ({
    getEntries: async () => {
      const entryApi = new EntryApi()
      await entryApi.setup()
      const result = await entryApi.getEntries()
      // console.log(result)
      if (result.kind === "ok") {
        self.saveEntries(result.entries)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    },
    filterEntries: async (start?:string, end?:string) => {
      const entryApi = new EntryApi()
      await entryApi.setup()
      const result = await entryApi.filterEntries(start,end)
      // console.log(result)
      if (result.kind === "ok") {
        self.saveEntries(result.entries)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    },
    clearStore:async ()=>{
      self.saveEntries([])
    }
  }))

type EntryStoreType = Instance<typeof EntryStoreModel>
export interface EntryStore extends EntryStoreType {}
type EntryStoreSnapshotType = SnapshotOut<typeof EntryStoreModel>
export interface EntryStoreSnapshot extends EntryStoreSnapshotType {}
export const createEntryStoreDefaultModel = () => types.optional(EntryStoreModel, {})
