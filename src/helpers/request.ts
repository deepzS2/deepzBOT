import axios, { AxiosRequestConfig } from 'axios'

interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'params'> {
  url: string | { value: string; params: Record<string, string | number> }
  query?: AxiosRequestConfig['params']
}

const URL_PARAMS_REGEX = /{[A-Za-z0-9]+}/g

/**
 * It takes a request options object, and returns a promise that resolves to the data
 * returned from the request
 * @param {RequestOptions} options - Request options
 * @returns The data from the request
 */
export async function request<T>({
  method = 'GET',
  url = '',
  query,
  ...options
}: RequestOptions) {
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

  const result = await axios.request<T>({
    ...options,
    method,
    url,
    params: query,
  })

  return result.data
}
