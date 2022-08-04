import { ApiResponse, ApisauceInstance, create } from "apisauce"
import { GetEntriesResult, PostEntryResult } from "./api.types"
import { getGeneralApiProblem } from "./api-problem"
import { loadString } from "../../utils/storage"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"


export class EntryApi {
  api: ApisauceInstance

  /**
   * Configurable options.
   */
  config: ApiConfig

  /**
   * Creates the api.
   *
   * @param config The configuration to use.
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
  }
  async setup() {
    // construct the apisauce instance

    const tok = await loadString("token")
    this.api = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "*/*",
        Authorization: `Basic Zm9vOmJhcg==`,
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        Bearer:tok
      },
    })
  }

  async getEntries(): Promise<GetEntriesResult> {
    const userId = await loadString("id")
    try {
      const response: ApiResponse<any> = await this.api.get(
        "calorie",
        { userid: userId },
      )
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const entries = response.data.calories

      return { kind: "ok", entries }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }

  async filterEntries(start?:string, end?:string): Promise<GetEntriesResult> {
    const userId = await loadString("id")
    try {

      const response: ApiResponse<any> = await this.api.get(
        "calorie",
        { userid: userId,startdate:start, enddate:end },
      )
      console.log(response)
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const entries = response.data.calories

      console.log(entries)
      return { kind: "ok", entries }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
  async addEntry(data): Promise<PostEntryResult> {
    try {

      const bodyData = {
        Food : data.entryName,
        CalorieCount: data.calorieCount,
        UserID:data.userId,
        Timestamp:data.selectedDate+" "+data.selectedTime
      }
      const response: ApiResponse<any> = await this.api.post(
        "calorie",bodyData
      )

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const entries = response.data.calories

      return { kind: "ok", entries }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
  async updateEntry(data): Promise<PostEntryResult> {
    try {

      const bodyData = {
        CalorieId:data.id,
        Food : data.entryName,
        CalorieCount: data.calorieCount,
        Timestamp:data.item.Timestamp,
        UserID: data.item.UserID
      }
      console.log(bodyData)

      const response: ApiResponse<any> = await this.api.put(
        "calorie",bodyData
      )
      console.log(response)

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const entries = response.data.calories

      return { kind: "ok", entries }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
  async deleteEntry(calorieId): Promise<PostEntryResult> {
    try {
      const response: ApiResponse<any> = await this.api.delete(
        "calorie/"+calorieId
      )

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const entries = response.data.calories

      return { kind: "ok", entries }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
