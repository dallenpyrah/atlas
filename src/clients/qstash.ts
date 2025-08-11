import { Client } from '@upstash/qstash'
import { env } from '@/lib/env'

let qstash: Client | null = null

if (env.QSTASH_TOKEN) {
  qstash = new Client({
    token: env.QSTASH_TOKEN,
  })
}

export default qstash
