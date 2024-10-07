# chat-p2p

## Setup 

Primeiro, instale a versão mais recente do nodejs(versão sugerida 20.18 LTS).

Em seguida, instale as dependências com `npm install`.

Para executar o criador da sala execute `node src/owner.js <nome-do-criador>`.

O comando a cima irá imprimir o endereço do criador, copie esse endereço, ele será usado para entrar na sala no comando abaixo.

Para conectar um peer na sala execute `node src/node.js <nome-do-peer> <endereco-criador>`.

