import { put, list, del, head, copy } from '@vercel/blob'

export { put, list, del, head, copy }

export const blobConfig = {
  token: process.env.BLOB_READ_WRITE_TOKEN,
}