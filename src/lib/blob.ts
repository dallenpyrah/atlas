import { copy, del, head, list, put } from '@vercel/blob'

export { put, list, del, head, copy }

export const blobConfig = {
  token: process.env.BLOB_READ_WRITE_TOKEN,
}
