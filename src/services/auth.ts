import { authClient } from '@/clients/auth'

export type SignInEmailParams = {
  email: string
  password: string
  callbackURL?: string
  rememberMe?: boolean
}

export type SignUpEmailParams = {
  email: string
  password: string
  name: string
  image?: string
  callbackURL?: string
}

export type RequestPasswordResetParams = {
  email: string
  redirectTo?: string
}

export type ResetPasswordParams = {
  newPassword: string
  token: string
}

export type SignInSocialParams = {
  provider: string
  callbackURL?: string
  errorCallbackURL?: string
  newUserCallbackURL?: string
  disableRedirect?: boolean
}

export class AuthService {
  async signInWithEmail(params: SignInEmailParams) {
    const { data, error } = await authClient.signIn.email({
      email: params.email,
      password: params.password,
      ...(params.callbackURL && { callbackURL: params.callbackURL }),
      ...(typeof params.rememberMe === 'boolean' && { rememberMe: params.rememberMe }),
    })

    if (error) {
      throw new Error(error.message || 'Failed to sign in')
    }

    return data
  }

  async signUpWithEmail(params: SignUpEmailParams) {
    const { data, error } = await authClient.signUp.email({
      email: params.email,
      password: params.password,
      name: params.name,
      ...(params.image && { image: params.image }),
      ...(params.callbackURL && { callbackURL: params.callbackURL }),
    })

    if (error) {
      throw new Error(error.message || 'Failed to sign up')
    }

    return data
  }

  async requestPasswordReset(params: RequestPasswordResetParams) {
    const { data, error } = await authClient.requestPasswordReset({
      email: params.email,
      redirectTo: params.redirectTo || '/reset-password',
    })

    if (error) {
      throw new Error(error.message || 'Failed to request password reset')
    }

    return data
  }

  async resetPassword(params: ResetPasswordParams) {
    const { data, error } = await authClient.resetPassword({
      newPassword: params.newPassword,
      token: params.token,
    })

    if (error) {
      throw new Error(error.message || 'Failed to reset password')
    }

    return data
  }

  async signInWithSocial(params: SignInSocialParams) {
    const { data, error } = await authClient.signIn.social({
      provider: params.provider,
      callbackURL: params.callbackURL || '/',
      ...(params.errorCallbackURL && { errorCallbackURL: params.errorCallbackURL }),
      ...(params.newUserCallbackURL && { newUserCallbackURL: params.newUserCallbackURL }),
      ...(params.disableRedirect !== undefined && { disableRedirect: params.disableRedirect }),
    } as any)

    if (error) {
      throw new Error(error.message || `Failed to sign in with ${params.provider}`)
    }

    return data
  }

  async signOut() {
    const { error } = await authClient.signOut()

    if (error) {
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  async getCurrentSession() {
    const { data, error } = await authClient.getSession()

    if (error) {
      throw new Error(error.message || 'Failed to get session')
    }

    return data
  }

  getProviderLabel(provider: string): string {
    const id = provider.toLowerCase()
    const labelMap: Record<string, string> = {
      github: 'GitHub',
      google: 'Google',
      twitter: 'X',
      x: 'X',
    }

    return labelMap[id] || id.charAt(0).toUpperCase() + id.slice(1)
  }
}

export const authService = new AuthService()
