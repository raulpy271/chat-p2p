
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { delay } from './utils.js'

export class Chat {
  constructor(name, node, owner) {
    this.topic = 'chat_01'
    this.meta_topic = 'meta_topic'
    this.peers = []
    this.name = name
    this.node = node
    this.id = node.peerId
    this.owner = null
    this.isOwner = false
    this.nextOwner = null
    this.lenghtChat = 10
    if (owner) {
      this.owner = this.id
      this.isOwner = true
    }
  }

  addPeer(peer) {
    this.peers.push({
      "peer": peer,
      "join_date": Date.now()
    })
  }

  setNextOwner() {
    this.peers.sort((p1, p2) => p1["join_date"] - p2["join_date"])
    this.nextOwner = this.peers[0]["peer"].id
  }

  promoteOwner() {
    this.owner = this.nextOwner
    this.nextOwner = null
    this.isOwner = this.owner.toString() === this.id.toString()
  }

  removePeer(peerId) {
    this.peers = this.peers.filter(peer => peer['peer'].id.toString() !== peerId.toString())
  }

  async discovery(evt) {
    const peer = evt.detail
    this.addPeer(peer)

    await this.node.dial(peer.id)
    if (!this.owner) {
      this.owner = this.node.getPeers()[0]
    }
    console.log(`Peer ${this.node.peerId.toString()} discovered: ${peer.id.toString()}`)
    if (this.isOwner) {
      this.setNextOwner()
      let msg = `set-next-owner:${this.nextOwner.toString()}`
      await delay(1000)
      await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))

      if(this.peers.length>=this.lenghtChat){
        console.log("Chat Cheio")
        let msg = 'chat-full:'+peer.id
        await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
      }
    }
  }

  async disconnect(evt) {
    let ownerDisconnected = false
    this.removePeer(evt.detail)
    if (evt.detail.toString() === this.owner.toString()) {
      ownerDisconnected = true
      console.log("O owner saiu, definindo novo nó mais velhor como owner")
      this.promoteOwner()
      console.log(`Novo owner: ${this.owner.toString()}`)
    }
    if (this.isOwner && this.peers.length > 0) {
      if (ownerDisconnected || (evt.detail.toString() === this.nextOwner.toString())) {
        this.setNextOwner()
        let msg = `set-next-owner:${this.nextOwner.toString()}`
        await delay(1000)
        await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
      }
    }
    console.log("\n Um nó foi de base " + evt.detail.toString())
  }

  async message(evt) {
    if (evt.detail.topic === this.meta_topic) {
      let msg = uint8ArrayToString(evt.detail.data)
      if (msg.startsWith('set-next-owner:')) {
        let nextOwner = msg.replace('set-next-owner:', '')
        if (this.id.toString() === nextOwner) {
            this.nextOwner = this.id
        } else {
          for (let peer of this.peers) {
            if (peer['peer'].id.toString() === nextOwner) {
              this.nextOwner = peer['peer'].id
              break
            }
          }
        }
      }
      if (msg.startsWith('banned:')) {
        let bannedPeer = msg.replace('banned:', '')
        if (bannedPeer === this.id.toString()) {
          console.log('Peer banido')
          process.exit()
        }
      }

      if (msg.startsWith('chat-full:')) {
        let bannedPeer = msg.replace('chat-full:', '')
        if (bannedPeer === this.id.toString()) {
          console.log('Chat Cheio!')
          process.exit()
        }
      }

      if (msg.startsWith('length-chat:')) {
        let length = parseInt(msg.replace('length-chat:', ''))
          this.lenghtChat = length
          console.log('Tamanho da sala alterada para '+  this.lenghtChat)
      }

      return
    }
    if (evt.detail.topic !== this.topic) {
      return
    }

    // Will not receive own published messages by default
    console.log(`node received: ${uint8ArrayToString(evt.detail.data)}`)
  }

  async handleInput(ipt) {
    let msg
    if (ipt.startsWith('/ban ')) {
      let bannedPeer = ipt.replace('/ban ', '')
      if (this.isOwner) {
        msg = `banned:${bannedPeer}`
        await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
      } else {
        console.log(`Somente Owner pode banir ${bannedPeer}`)
      }
    }

    if (ipt.startsWith('/length-chat ')) {
      let length = parseInt(ipt.replace('/length-chat ', ''))
      if (this.isOwner) {
        msg = `length-chat:${length}`
        if(length< this.peers.length){
          console.log("O tamanho deve ser pelo menos maior do que a quantidade de peers atual!")
          return
        }
        
        ipt = ""

        this.lenghtChat = parseInt(length)
        console.log("Tamanho da sala alterada para "+length)
        await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
      } else {
        console.log(`Somente Owner alterar o tamanho da sala!`)
      }
    }

    if (ipt.startsWith('/length-chat-view')) {
      console.log("Atamanho atual: "+this.lenghtChat)
      ipt = ""
    }

    if (ipt.startsWith('chat-full:')) {
      ipt = ipt.replace('chat-full:', '')
    }

    if(ipt.length>0){
      msg = `${this.name}: ${ipt}`
      await this.node.services.pubsub.publish(this.topic, uint8ArrayFromString(msg))
    }
  }
}
