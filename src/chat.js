
export class Chat {
  constructor(name, node) {
    this.peers = []
    this.name = name
    this.node = node
    this.id = node.peerId
    this.owner = null
  }

  addPeer(peer) {
    this.peers.push({
      "peer": peer,
      "join_date": Date.now()
    })
  }

  removePeer(peerId) {
    this.peers = this.peers.filter(peer => peer['peer'].id.toString() !== peerId.toString())
  }

  async discovery(evt) {
    const peer = evt.detail
    this.addPeer(peer)
    await this.node.dial(peer.id)
    console.log(`Peer ${this.node.peerId.toString()} discovered: ${peer.id.toString()}`)
  }

  async disconnect(evt) {
    this.removePeer(evt.detail)
    console.log("\n Um nó foi de base " + evt.detail.toString())
  }
}
