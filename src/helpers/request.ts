import axios, { AxiosRequestConfig, AxiosInstance } from 'axios'

interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'params'> {
  url: string | { value: string; params: Record<string, string | number> }
  query?: AxiosRequestConfig['params']
}

// search for {charactersanddigitals} patterns inside string
const URL_PARAMS_REGEX = /{[A-Za-z0-9]+}/g

/**
 * Creates a axios instance to use with request function
 * @param {AxiosRequestConfig} config - AxiosRequestConfig
 * @returns A function that returns the request
 */
export function createRequest(config: AxiosRequestConfig) {
  const axiosInstance = axios.create(config)

  return <T>(options: RequestOptions) => {
    return request<T>(options, axiosInstance)
  }
}

/**
 * It takes a request options object, and returns a promise that resolves to the data
 * returned from the request
 * @param {RequestOptions} options - Request options
 * @returns The data from the request
 */
export async function request<T>(options: RequestOptions): Promise<T>
/**
 * It takes a request options object, and returns a promise that resolves to the data
 * returned from the request
 * @param {RequestOptions} options - Request options
 * @param {AxiosInstance} axiosInstance - Axios instance
 * @returns The data from the request
 */
export async function request<T>(
  options: RequestOptions,
  createdAxiosInstance: AxiosInstance
): Promise<T>

export async function request<T>(
  { method = 'GET', url = '', query, ...options }: RequestOptions,
  createdAxiosInstance?: AxiosInstance
) {
  if (typeof url === 'object') {
    const paramsKeys = url.value
      .match(URL_PARAMS_REGEX)
      .map((str) => str.replace(/({|})/g, ''))

    const paramsObj = url.params

    url = paramsKeys.reduce((prev, curr) => {
      prev = prev.replace(`{${curr}}`, paramsObj[curr].toString())

      return prev
    }, url.value)
  }

  const result = await (createdAxiosInstance
    ? createdAxiosInstance
    : axios
  ).request<T>({
    ...options,
    method,
    url,
    params: query,
  })

  return result.data
}
