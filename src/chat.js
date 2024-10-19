
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { delay } from './utils.js'

export class Chat {
  constructor(name, owner) {
    this.topic = 'chat_01'
    this.meta_topic = 'meta_topic'
    this.peers = []
    this.name = name
    this.node = null
    this.id = null
    this.owner = null
    this.isOwner = false
    this.events = {}
    this.nextOwner = null
    this.lenghtChat = 10
    if (owner) {
      this.isOwner = true
    }
  }

  setNode(node) {
    this.node = node
    this.id = node.peerId
    if (this.isOwner) {
      this.owner = this.id
    }
  }

  addPeer(peer) {
    this.peers.push({
      "peer": peer,
      "name": null,
      "join_date": Date.now()
    })
  }

  findPeer(peerId) {
    let peersFound = this.peers.filter(peer => peer['peer'].id.toString() === peerId.toString())
    if (peersFound) {
      return peersFound[0]
    } else {
      return null
    }
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

  addEventListener(evt, callback) {
    this.events[evt] = callback
  }

  handleEvent(evt, value) {
    if (this.events[evt]) {
      this.events[evt](value)
    }
  }

  async discovery(evt) {
    const peer = evt.detail
    this.addPeer(peer)

    await this.node.dial(peer.id)
    if (!this.owner) {
      this.owner = this.node.getPeers()[0]
    }
    console.log(`Peer ${this.node.peerId.toString()} discovered: ${peer.id.toString()}`)
    // Delay necessário pois a decoberta do peer não é imediata à subscrição no tópico
    await delay(1000)
    let msg = `peer-name:${this.name}`
    await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
    if (this.isOwner) {
      this.setNextOwner()
      msg = `set-next-owner:${this.nextOwner.toString()}`
      await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
      if (this.peers.length >= this.lenghtChat) {
        console.log("Chat Cheio")
        msg = 'chat-full:'+peer.id
        await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
      }
    }
  }

  async disconnect(evt) {
    let ownerDisconnected = false
    let disconnectedPeer = this.findPeer(evt.detail)
    this.removePeer(evt.detail)
    if (evt.detail.toString() === this.owner.toString()) {
      ownerDisconnected = true
      console.log("O owner saiu, definindo novo nó mais velhor como owner")
      this.promoteOwner()
      console.log(`Novo owner: ${this.owner.toString()}`)
      this.handleEvent('owner-changed', this.isOwner)
    }
    if (this.isOwner && this.peers.length > 0) {
      if (ownerDisconnected || (evt.detail.toString() === this.nextOwner.toString())) {
        this.setNextOwner()
        let msg = `set-next-owner:${this.nextOwner.toString()}`
        await delay(1000)
        await this.node.services.pubsub.publish(this.meta_topic, uint8ArrayFromString(msg))
      }
    }
    console.log("\n Um nó foi de base " + disconnectedPeer["name"])
    this.handleEvent('disconnected', disconnectedPeer)
  }

  async message(evt) {
    let msg = uint8ArrayToString(evt.detail.data)
    if (evt.detail.topic === this.meta_topic) {
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

      if (msg.startsWith('peer-name:')) {
        let name = msg.replace('peer-name:', '')
        let peer = this.findPeer(evt.detail.from)
        if (peer) {
          if (!peer["name"]) {
            peer["name"] = name
            console.log(`Nome do nó ${peer["peer"].id.toString()}: ${name}`)
            this.handleEvent('peer-name-discovered', peer)
          }
        } else {
          console.log(`Peer não encontrato: ${evt.detail.from.toString()}`)
        }
      }


      return
    }
    if (evt.detail.topic !== this.topic) {
      return
    }

    // Will not receive own published messages by default
    console.log(`node received: ${msg}`)
    this.handleEvent('msg-received', msg)
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
