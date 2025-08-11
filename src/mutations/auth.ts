'use client'
import { type UseMutationOptions, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  authService,
  type RequestPasswordResetParams,
  type ResetPasswordParams,
  type SignInEmailParams,
  type SignInSocialParams,
  type SignUpEmailParams,
} from '@/services/auth'

export function useSignInEmailMutation(
  options?: UseMutationOptions<unknown, Error, SignInEmailParams>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, SignInEmailParams> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success('Signed in')
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || 'Failed to sign in')
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, SignInEmailParams>({
    mutationKey: ['auth', 'sign-in', 'email'],
    mutationFn: (params: SignInEmailParams) => authService.signInWithEmail(params),
    ...mergedOptions,
  })
}

export function useSignUpEmailMutation(
  options?: UseMutationOptions<unknown, Error, SignUpEmailParams>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, SignUpEmailParams> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success('Account created')
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || 'Failed to sign up')
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, SignUpEmailParams>({
    mutationKey: ['auth', 'sign-up', 'email'],
    mutationFn: (params: SignUpEmailParams) => authService.signUpWithEmail(params),
    ...mergedOptions,
  })
}

export function useRequestPasswordResetMutation(
  options?: UseMutationOptions<unknown, Error, RequestPasswordResetParams>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, RequestPasswordResetParams> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success('If an account exists, a reset email was sent')
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || 'Failed to request reset')
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, RequestPasswordResetParams>({
    mutationKey: ['auth', 'password', 'request-reset'],
    mutationFn: (params: RequestPasswordResetParams) => authService.requestPasswordReset(params),
    ...mergedOptions,
  })
}

export function useResetPasswordMutation(
  options?: UseMutationOptions<unknown, Error, ResetPasswordParams>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, ResetPasswordParams> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success('Password updated')
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || 'Failed to reset password')
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, ResetPasswordParams>({
    mutationKey: ['auth', 'password', 'reset'],
    mutationFn: (params: ResetPasswordParams) => authService.resetPassword(params),
    ...mergedOptions,
  })
}

export function useSignInSocialMutation(
  options?: UseMutationOptions<unknown, Error, SignInSocialParams>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, SignInSocialParams> = {
    ...(options || {}),
    onMutate: async (variables) => {
      toast.message(`Redirecting to ${authService.getProviderLabel(variables.provider)}…`)
      if (options?.onMutate) await options.onMutate(variables)
    },
    onError: (error, variables, ctx) => {
      toast.error(
        error.message ||
          `Failed to sign in with ${authService.getProviderLabel(variables.provider)}`,
      )
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, SignInSocialParams>({
    mutationKey: ['auth', 'sign-in', 'social'],
    mutationFn: (params: SignInSocialParams) => authService.signInWithSocial(params),
    ...mergedOptions,
  })
}

export function useSignOutMutation(options?: UseMutationOptions<unknown, Error, void>) {
  const mergedOptions: UseMutationOptions<unknown, Error, void> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success('Signed out')
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || 'Failed to sign out')
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, void>({
    mutationKey: ['auth', 'sign-out'],
    mutationFn: () => authService.signOut(),
    ...mergedOptions,
  })
}
