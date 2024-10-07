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

const createNode = async () => {
  const node = await createLibp2p({
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
  })

  return node
}

const topic = 'chat_01'
const nodeName = process.argv[2]
const node = await createNode()
console.log(`Peer ${nodeName} id = ${node.peerId.toString()}`)
console.log(`node addr: ${node.getMultiaddrs()}`)

// subscribe
node.services.pubsub.addEventListener('message', (evt) => {
  if (evt.detail.topic !== topic) {
    return
  }

  // Will not receive own published messages by default
  console.log(`node received: ${uint8ArrayToString(evt.detail.data)}`)
})
node.services.pubsub.subscribe(topic)

const validate = (msgTopic, msg) => {
  return 'accept'
}

node.services.pubsub.topicValidators.set(topic, validate)

