
var name = null
const sendBtn = document.getElementById('send-btn')
const textArea = document.getElementsByTagName('textarea')[0]
const msgWindow = document.getElementsByClassName('msgs')[0]
const user = document.getElementById('user-profile')
const regexName = /^(.*?):/;
const regexMsg = /: (.*)/;

const renderer = async () => {
  const me = await chat.me()
  name = me["name"]
  const addrs = await chat.addrs()
  if (me["isOwner"]) {
    user.innerText = `Olá ${name} - Admin`
  } else {
    user.innerText = `Olá ${name}`
  }
  const addrsDiv = document.getElementById('addrs')
  addrsDiv.innerHTML += 'Seus endereços são:'
  for (let add of addrs) {
    addrsDiv.innerHTML += `<p>${add}</p>`
  }
}

sendBtn.addEventListener('click', async () => {
  await chat.msg(textArea.value)
})

chat.onMsgReceived((msg) => {
  const matchUser = msg.match(regexName);
  const matchMsg = msg.match(regexMsg);
  const userName = matchUser[1]
  const message = matchMsg[1]
  msgWindow.innerHTML += `<div class="received-msg"> <p class="msg-user">${userName}: </p> <p class="msg">${message}</p> </div>`
  console.log(`mensagem recebida: ${msg}`)
})

chat.onDisconnected((peer) => {
  msgWindow.innerHTML += `<div class="received-msg"> <p class="msg">Peer disconectado: <span>${peer["name"]}</span></p> </div>`
  console.log(`Peer disconectado ${peer["name"]}`)
})

chat.onNameDiscovered((peer) => {
  msgWindow.innerHTML += `<div class="received-msg"> <p class="msg">Peer entrou na sala: <span>${peer["name"]}</span></p> </div>`
  console.log(`Peer descoberto ${peer["name"]}`)
})

chat.onOwnerChanged((isOwner) => {
  if (isOwner) {
    user.innerText = `Olá ${name} - Admin`
  } else {
    user.innerText = `Olá ${name}`
  }
})

renderer()
