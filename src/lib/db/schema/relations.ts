import { relations } from 'drizzle-orm'
import { account, session, user } from './auth'
import { chat, chatStream, message } from './chat'
import { file, filePermission, fileVersion } from './file'
import { invitation, member, organization } from './organization'
import { space, spaceInvitation, spaceMember } from './space'
import { subscription } from './subscription'
import { task, taskStream } from './task'

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  subscriptions: many(subscription),
  members: many(member),
  invitations: many(invitation),
  spaces: many(space),
  spaceMembers: many(spaceMember),
  spaceInvitations: many(spaceInvitation),
  chats: many(chat),
  tasks: many(task),
  files: many(file),
  filePermissions: many(filePermission),
  fileVersions: many(fileVersion),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  spaces: many(space),
  files: many(file),
}))

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  invitedBy: one(user, {
    fields: [invitation.invitedBy],
    references: [user.id],
  }),
}))

export const spaceRelations = relations(space, ({ one, many }) => ({
  user: one(user, {
    fields: [space.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [space.organizationId],
    references: [organization.id],
  }),
  members: many(spaceMember),
  invitations: many(spaceInvitation),
  chats: many(chat),
  tasks: many(task),
  files: many(file),
}))

export const spaceMemberRelations = relations(spaceMember, ({ one }) => ({
  space: one(space, {
    fields: [spaceMember.spaceId],
    references: [space.id],
  }),
  user: one(user, {
    fields: [spaceMember.userId],
    references: [user.id],
  }),
}))

export const spaceInvitationRelations = relations(spaceInvitation, ({ one }) => ({
  space: one(space, {
    fields: [spaceInvitation.spaceId],
    references: [space.id],
  }),
  invitedBy: one(user, {
    fields: [spaceInvitation.invitedBy],
    references: [user.id],
  }),
}))

export const chatRelations = relations(chat, ({ one, many }) => ({
  space: one(space, {
    fields: [chat.spaceId],
    references: [space.id],
  }),
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
  messages: many(message),
  streams: many(chatStream),
  tasks: many(task),
}))

export const messageRelations = relations(message, ({ one }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
}))

export const chatStreamRelations = relations(chatStream, ({ one }) => ({
  chat: one(chat, {
    fields: [chatStream.chatId],
    references: [chat.id],
  }),
}))

export const taskRelations = relations(task, ({ one, many }) => ({
  space: one(space, {
    fields: [task.spaceId],
    references: [space.id],
  }),
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
  chat: one(chat, {
    fields: [task.chatId],
    references: [chat.id],
  }),
  streams: many(taskStream),
}))

export const taskStreamRelations = relations(taskStream, ({ one }) => ({
  task: one(task, {
    fields: [taskStream.taskId],
    references: [task.id],
  }),
}))

export const fileRelations = relations(file, ({ one, many }) => ({
  user: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  space: one(space, {
    fields: [file.spaceId],
    references: [space.id],
  }),
  organization: one(organization, {
    fields: [file.organizationId],
    references: [organization.id],
  }),
  permissions: many(filePermission),
  versions: many(fileVersion),
}))

export const filePermissionRelations = relations(filePermission, ({ one }) => ({
  file: one(file, {
    fields: [filePermission.fileId],
    references: [file.id],
  }),
  user: one(user, {
    fields: [filePermission.userId],
    references: [user.id],
  }),
  grantedByUser: one(user, {
    fields: [filePermission.grantedBy],
    references: [user.id],
  }),
}))

export const fileVersionRelations = relations(fileVersion, ({ one }) => ({
  file: one(file, {
    fields: [fileVersion.fileId],
    references: [file.id],
  }),
  uploadedByUser: one(user, {
    fields: [fileVersion.uploadedBy],
    references: [user.id],
  }),
}))
