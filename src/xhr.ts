/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';
import axiosCancel from 'axios-cancel'
import axios, { AxiosResponse, AxiosError } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import Keycloak from 'keycloak-js'
import { RequestOptions } from './types'

// create an instance
export const axiosInstance = axios.create()

// cancellation of http requests
axiosCancel(axios as any, {
  debug: false
})

export { MockAdapter }

export const getMockAdapter = (options = {}): MockAdapter => new MockAdapter(axiosInstance, options)

export const getKeycloak = (): Keycloak.KeycloakInstance => window.keycloak || top.window.keycloak // eslint-disable-line no-restricted-globals

export const getKeycloakToken = (): string | undefined => (getKeycloak() ? getKeycloak().token : undefined)

export const getOptionsWithAuth = (requestId: string): RequestOptions => ({
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${getKeycloakToken()}`
  },
  requestId
})

export const getOptionsWithoutAuth = (requestId: string): RequestOptions => ({
  requestId
})

export const getOptions = (useAuth: boolean, requestId: string): RequestOptions =>
  useAuth ? getOptionsWithAuth(requestId) : getOptionsWithoutAuth(requestId)


const shouldUseAuth = (): boolean => process.env.NODE_ENV !== 'test'

export const getOptionsObject = (): RequestOptions => {
    const requestId = uuidv4()
    const useAuth = shouldUseAuth()
    return getOptions(useAuth, requestId)
}

function getMergedOptionsObject(options: any): RequestOptions & any {
    const commonOptions = getOptionsObject()
    return {
      ...commonOptions,
      ...options
    }
}

export const updateToken = (): Promise<string | void> => {
    if (!shouldUseAuth()) {
      return Promise.resolve('No token update needed')
    }
    return new Promise((resolve, reject) => {
      const minValidity = 30
      getKeycloak()
        .updateToken(minValidity)
        .success(() => {
          resolve('Token updated')
        })
        .error(() => {
          reject(new Error('Failed to refresh keycloak token!'))
        })
    })
}

export const get = async <T extends unknown = any>(url: string, options: any = {}): Promise<AxiosResponse<T>> => {
    await updateToken().catch(e => {
      throw new Error(e)
    })
    return axiosInstance.get<T>(url, getMergedOptionsObject(options))
}

export const patch = async (url: string, patchBody: any = {}, options: any = {}): Promise<AxiosResponse<void>> => {
  await updateToken().catch(e => {
    throw new Error(e)
  })
  return axiosInstance.patch(url, patchBody, getMergedOptionsObject(options))
}

export const post = async <T extends unknown = void>(
  url: string,
  postBody: any = {},
  options: any = {}
): Promise<AxiosResponse<T>> => {
  await updateToken().catch(e => {
    throw new Error(e)
  })
  return axiosInstance.post<T>(url, postBody, getMergedOptionsObject(options))
}

export const put = async (url: string, putBody: any = {}, options: any = {}): Promise<AxiosResponse<void>> => {
  await updateToken().catch(e => {
    throw new Error(e)
  })
  return axiosInstance.put(url, putBody, getMergedOptionsObject(options))
}

export const del = async (url: string, options: any = {}): Promise<AxiosResponse<void>> => {
  await updateToken().catch(e => {
    throw new Error(e)
  })
  return axiosInstance.delete(url, getMergedOptionsObject(options))
}

export const parseError = (payload: AxiosError): string =>
  payload.response && payload.response.data ? payload.response.data.message : payload.message
