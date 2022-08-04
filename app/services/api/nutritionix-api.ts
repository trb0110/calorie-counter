import { ApiResponse, ApisauceInstance, create } from "apisauce"
import { GetLookupResult } from "./api.types"
import { getGeneralApiProblem } from "./api-problem"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"


export class NutriApi {
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

    this.api = create({
      baseURL: "https://trackapi.nutritionix.com/v2/search/",
      timeout: this.config.timeout,
      headers: {
        Accept: "*/*",
        "x-app-id": `fabb810c`,
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "x-app-key":"b12f1539b806f63c2fce916cf0a74d54"
      },
    })
  }

  async getLookup(q:string): Promise<GetLookupResult> {
    try {
      const response: ApiResponse<any> = await this.api.get(
        "instant",
        { query: q },
      )
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      const lookup = response.data.common

      return { kind: "ok", lookup }
    } catch (e) {
      __DEV__ && console.tron.log(e.message)
      return { kind: "bad-data" }
    }
  }


}
