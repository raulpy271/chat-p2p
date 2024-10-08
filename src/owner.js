/* eslint-disable no-console */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import readline from 'readline'
import {delay} from './utils.js'
import {createNode} from './p2p.js'

const rl = readline.promises.createInterface(process.stdin, process.stdout)
const topic = 'chat_01'
const nodeName = process.argv[2]
const node = await createNode()
var peers = []
console.log(`Peer ${nodeName} id = ${node.peerId.toString()}`)
console.log(`node addr: ${node.getMultiaddrs()}`)

node.addEventListener('peer:discovery', (evt) => {
  const peer = evt.detail
  peers.push(peer)
  console.log(`Peer ${node.peerId.toString()} discovered: ${peer.id.toString()}`)
})

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

await delay(1000)
while (true) {
  if (peers.length > 0) {
    let ipt = await rl.question('Digite mensagem no chat: ')
    let msg = `${nodeName}: ${ipt}`
    await node.services.pubsub.publish(topic, uint8ArrayFromString(msg))
  }
  await delay(3000)
}

