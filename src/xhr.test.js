import { v4 as uuidv4 } from 'uuid'

import {
  getMockAdapter,
  getOptions,
  getOptionsWithoutAuth,
  getOptionsWithAuth,
  updateToken,
  get,
  put,
  post,
  patch,
  del
} from './xhr.ts'

const testUrl = 'http://localhost:8081/test'
const mockResponse = { foo: 'bar' }
const mockPutBody = { put: 'body' }
const mockPostBody = { post: 'body' }
const mockPatchBody = { patch: 'body' }
const STATUS_CODE_OK = 200

describe('Get correct options', () => {
  let mockAdapter
  beforeAll(() => {
    mockAdapter = getMockAdapter()
    mockAdapter.onGet(testUrl).reply(STATUS_CODE_OK, mockResponse)
    mockAdapter.onPut(testUrl, mockPutBody).reply(STATUS_CODE_OK, mockResponse)
    mockAdapter.onPost(testUrl, mockPostBody).reply(STATUS_CODE_OK, mockResponse)
    mockAdapter.onPatch(testUrl, mockPatchBody).reply(STATUS_CODE_OK, mockResponse)
    mockAdapter.onDelete(testUrl).reply(STATUS_CODE_OK, mockResponse)
    window.keycloak = {
      token: {},
      tokenParsed: {
        organizations: ['3a5e5fee-a582-4f44-88a9-53a7a900ee3a'],
        user_name: 'LocalTestUser',
        markets: 'Sweden'
      },
      refreshTokenParsed: {
        exp: 1551112329
      },
      clearToken: () => {},
      updateToken: () => ({
        success: callback => callback(),
        error: callback => callback()
      })
    }
  })

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  afterAll(() => {
    mockAdapter.reset()
  })

  it('Should return options WITHOUT auth', () => {
    const requestId = uuidv4()
    const options = getOptions(false, requestId)
    expect(options).toEqual(getOptionsWithoutAuth(requestId))
    expect(options).not.toHaveProperty('headers.Authorization')
  })

  it('Should return options WITH auth', () => {
    const requestId = uuidv4()
    const options = getOptions(true, requestId)
    expect(options).toEqual(getOptionsWithAuth(requestId))
    expect(options).toHaveProperty('headers.Authorization')
  })

  it('Should not update token on local env', () => {
    process.env.NODE_ENV = 'test'
    return updateToken().then(result => expect(result).toEqual('No token update needed'))
  })

  it('Should update token when not running in local dev', () => {
    process.env.NODE_ENV = 'prod'
    return updateToken().then(result => expect(result).toEqual('Token updated'))
  })

  it('Should GET', () =>
    get(testUrl).then(result => {
      expect(result.data).toEqual(mockResponse)
    }))

  it('Should PUT', () =>
    put(testUrl, mockPutBody).then(result => {
      expect(result.data).toEqual(mockResponse)
    }))

  it('Should POST', () =>
    post(testUrl, mockPostBody).then(result => {
      expect(result.data).toEqual(mockResponse)
    }))

  it('Should PATCH', () =>
    patch(testUrl, mockPatchBody).then(result => {
      expect(result.data).toEqual(mockResponse)
    }))

  it('Should DELETE', () =>
    del(testUrl).then(result => {
      expect(result.data).toEqual(mockResponse)
    }))
})
