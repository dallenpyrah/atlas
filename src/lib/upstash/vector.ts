import { Index } from '@upstash/vector'
import { env } from '@/lib/env'

export type VectorMetadata = {
  title: string
  content: string
  type: string
  userId?: string
  createdAt: number
}

let vectorIndex: Index<VectorMetadata> | null = null

if (env.UPSTASH_VECTOR_REST_URL && env.UPSTASH_VECTOR_REST_TOKEN) {
  vectorIndex = new Index<VectorMetadata>({
    url: env.UPSTASH_VECTOR_REST_URL,
    token: env.UPSTASH_VECTOR_REST_TOKEN,
  })
}

export default vectorIndex
