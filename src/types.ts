declare module 'keycloak-js' {
  interface KeycloakTokenParsed {
    organizations?: string[]
    // eslint-disable-next-line camelcase
    user_name?: string
    markets?: string
    exp?: number
  }
}

declare global {
  interface Window {
    keycloak: Keycloak.KeycloakInstance
  }
}

export interface RequestOptions {
  requestId: string
  headers?: {
    Accept: string
    Authorization: string
  }
}
