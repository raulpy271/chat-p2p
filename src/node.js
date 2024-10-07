/* eslint-disable no-console */

import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify, identifyPush } from '@libp2p/identify'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { bootstrap } from '@libp2p/bootstrap'

const createNode = async (owner) => {
  const config = {
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 1000
      })
    ],
    services: {
      pubsub: gossipsub(),
      identify: identify(),
      identifyPush: identifyPush()
    }
  }

  config.peerDiscovery.push(bootstrap({list: [owner]}))

  return await createLibp2p(config)
}

const topic = 'chat_01'
const nodeName = process.argv[2]
const ownerAddr = process.argv[3]
console.log(`Connecting to ${ownerAddr}`)
const node = await createNode(ownerAddr)
console.log(`Peer ${nodeName} id = ${node.peerId.toString()}`)

node.addEventListener('peer:discovery', (evt) => {
  const peer = evt.detail
  console.log(`Peer ${node.peerId.toString()} discovered: ${peer.id.toString()}`)
})

node.services.pubsub.addEventListener('message', (evt) => {
  if (evt.detail.topic !== topic) {
    return
  }

  // Will not receive own published messages by default
  console.log(`node received: ${uint8ArrayToString(evt.detail.data)}`)
})
node.services.pubsub.subscribe(topic)

await delay(1000 * 5)

const validate = (msgTopic, msg) => {
  return 'accept'
}

node.services.pubsub.topicValidators.set(topic, validate)

await delay(1000)
while (true) {
  let msg = `${nodeName}: ping!`
  await node.services.pubsub.publish(topic, uint8ArrayFromString(msg))
  await delay(3000)
}

async function delay (ms) {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

