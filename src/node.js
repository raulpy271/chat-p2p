/* eslint-disable no-console */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import {delay, rl} from './utils.js'
import {createNode} from './p2p.js'
import {Chat} from './chat.js'

var owner
const nodeName = process.argv[2]
const ownerAddr = process.argv[3]
if (ownerAddr) {
  console.log(`Connecting to ${ownerAddr}`)
  owner = false
} else {
  console.log(`Criando sala`)
  owner = true
}
const node = await createNode(ownerAddr)
export const chat = new Chat(nodeName, node, owner)
console.log(`Peer ${nodeName} id = ${node.peerId.toString()}`)
console.log(`node addr: ${node.getMultiaddrs()}`)

node.addEventListener('peer:discovery', async (e) => await chat.discovery(e))
node.addEventListener('peer:disconnect', async (e) => await chat.disconnect(e))
node.services.pubsub.addEventListener('message', async (e) => await chat.message(e))

node.services.pubsub.subscribe(chat.topic)
node.services.pubsub.subscribe(chat.meta_topic)

await delay(500 * 5)

const validate = (msgTopic, msg) => {
  return 'accept'
}

node.services.pubsub.topicValidators.set(chat.topic, validate)
node.services.pubsub.topicValidators.set(chat.meta_topic, validate)

//await delay(1000)
//while (true) {
//  if (chat.peers.length > 0) {
//    let ipt = await rl.question('Digite mensagem no chat: ')
//    await chat.handleInput(ipt)
//  }
//  await delay(3000)
//  console.log(chat.peers)
//  console.log(chat.id)
//  console.log(chat.owner)
//  console.log(chat.nextOwner)
//}

