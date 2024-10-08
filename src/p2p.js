
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { identify, identifyPush } from '@libp2p/identify'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'

export async function createNode(owner) {
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
  if (owner) {
    config.peerDiscovery.push(bootstrap({list: [owner]}))
  }
  return await createLibp2p(config)
}

