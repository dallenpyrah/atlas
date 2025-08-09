import { Client } from '@upstash/qstash'

let qstash: Client | null = null

if (process.env.QSTASH_TOKEN) {
  qstash = new Client({
    token: process.env.QSTASH_TOKEN,
  })
}

export default qstash
