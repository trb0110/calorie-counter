import { GeneralApiProblem } from "./api-problem"
import { Entry } from "../../models/entry/entry"

export interface User {
  id: number
  name: string
  password?: string
  role?: string
  token?: string
}

export type GetUsersResult = { kind: "ok"; users: User[] } | GeneralApiProblem
export type GetUserResult = { kind: "ok"; user: User } | GeneralApiProblem
export type GetLoginResult = { kind: "ok"; loginResult: User } | GeneralApiProblem

export type GetEntriesResult = { kind: "ok"; entries: Entry[] } | GeneralApiProblem
export type GetLookupResult = { kind: "ok"; lookup: any[] } | GeneralApiProblem
export type PostEntryResult = { kind: "ok"; entries: Entry } | GeneralApiProblem
export type GetEntryResult = { kind: "ok"; entry: Entry } | GeneralApiProblem
