import {useCallback} from "react"
import useApiHelper from "@/hooks/useApiHelper"
import {Plugin, PluginID} from "@/types/plugin"
import {useFetchWithUnlockCode} from "@/components/UnlockCode"


export interface GetModelsRequestProps {
  key: string
}

const useApiService = () => {
  const fetchService = useFetchWithUnlockCode()
  const {getApiUrl} = useApiHelper()

  const getModels = useCallback(
    (params: GetModelsRequestProps, signal?: AbortSignal) => {
      return fetchService.post<GetModelsRequestProps>(getApiUrl("/api/models"), {
        body: {key: params.key},
        headers: {
          "Content-Type": "application/json"
        },
        signal
      })
    },
    [fetchService, getApiUrl]
  )

  const getEndpoint = useCallback(
    (plugin: Plugin | null) => {
      if (!plugin) {
        return getApiUrl("/api/chat")
      }

      if (plugin.id === PluginID.GOOGLE_SEARCH) {
        return getApiUrl("/api/google")
      }

      return getApiUrl("/api/chat")
    },
    [getApiUrl]
  )

  return {
    getModels,
    getEndpoint
  }
}

export default useApiService
