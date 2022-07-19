import fetch, { RequestInfo, RequestInit } from 'node-fetch'

/**
 * It takes a URL and an optional RequestInit object, and returns a Promise that resolves to
 * the JSON response
 * @param {RequestInfo} url - RequestInfo
 * @param {RequestInit} [init] - This is an optional parameter that allows you to pass in any
 * additional information you want to send to the server.
 * @returns A function that returns a promise that resolves to a generic type.
 */
export default async function request<Response = any>(
  url: RequestInfo,
  init?: RequestInit
) {
  return fetch(url, init).then((res) => res.json() as Promise<Response>)
}
