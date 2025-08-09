"use client"
import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

type SignInVariables = {
  email: string
  password: string
  callbackURL?: string
  rememberMe?: boolean
}

type SignUpVariables = {
  email: string
  password: string
  name: string
  image?: string
  callbackURL?: string
}

type RequestPasswordResetVariables = {
  email: string
  redirectTo?: string
}

type ResetPasswordVariables = {
  newPassword: string
  token: string
}

export function useSignInEmailMutation(
  options?: UseMutationOptions<unknown, Error, SignInVariables>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, SignInVariables> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success("Signed in")
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || "Failed to sign in")
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, SignInVariables>({
    mutationKey: ["auth", "sign-in", "email"],
    mutationFn: async ({ email, password, callbackURL, rememberMe }: SignInVariables) => {
      const payload: { email: string; password: string; callbackURL?: string; rememberMe?: boolean } = {
        email,
        password,
      }
      if (typeof callbackURL === "string") payload.callbackURL = callbackURL
      if (typeof rememberMe === "boolean") payload.rememberMe = rememberMe
      const { data, error } = await authClient.signIn.email(payload)
      if (error) throw new Error(error.message)
      return data
    },
    ...mergedOptions,
  })
}

export function useSignUpEmailMutation(
  options?: UseMutationOptions<unknown, Error, SignUpVariables>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, SignUpVariables> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success("Account created")
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || "Failed to sign up")
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, SignUpVariables>({
    mutationKey: ["auth", "sign-up", "email"],
    mutationFn: async ({ email, password, name, image, callbackURL }: SignUpVariables) => {
      const payload: { email: string; password: string; name: string; image?: string; callbackURL?: string } = {
        email,
        password,
        name,
      }
      if (typeof image === "string" && image) payload.image = image
      if (typeof callbackURL === "string") payload.callbackURL = callbackURL
      const { data, error } = await authClient.signUp.email(payload)
      if (error) throw new Error(error.message)
      return data
    },
    ...mergedOptions,
  })
}

export function useRequestPasswordResetMutation(
  options?: UseMutationOptions<unknown, Error, RequestPasswordResetVariables>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, RequestPasswordResetVariables> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success("If an account exists, a reset email was sent")
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || "Failed to request reset")
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, RequestPasswordResetVariables>({
    mutationKey: ["auth", "password", "request-reset"],
    mutationFn: async ({ email, redirectTo = "/reset-password" }: RequestPasswordResetVariables) => {
      const { data, error } = await authClient.requestPasswordReset({ email, redirectTo })
      if (error) throw new Error(error.message)
      return data
    },
    ...mergedOptions,
  })
}

export function useResetPasswordMutation(
  options?: UseMutationOptions<unknown, Error, ResetPasswordVariables>,
) {
  const mergedOptions: UseMutationOptions<unknown, Error, ResetPasswordVariables> = {
    ...(options || {}),
    onSuccess: (data, variables, ctx) => {
      toast.success("Password updated")
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      toast.error(error.message || "Failed to reset password")
      options?.onError?.(error, variables, ctx)
    },
  }
  return useMutation<unknown, Error, ResetPasswordVariables>({
    mutationKey: ["auth", "password", "reset"],
    mutationFn: async ({ newPassword, token }: ResetPasswordVariables) => {
      const { data, error } = await authClient.resetPassword({ newPassword, token })
      if (error) throw new Error(error.message)
      return data
    },
    ...mergedOptions,
  })
}


