import { Index } from '@upstash/vector'

export type VectorMetadata = {
  title: string
  content: string
  type: string
  userId?: string
  createdAt: number
}

let vectorIndex: Index<VectorMetadata> | null = null

if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
  vectorIndex = new Index<VectorMetadata>({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  })
}

export default vectorIndex
