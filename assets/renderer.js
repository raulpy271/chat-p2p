
var name = null
var inactiveTime = 0
const MAX_INACTIVE_TIME = 3 * 60
const sendBtn = document.getElementById('send-btn')
const textArea = document.getElementsByTagName('textarea')[0]
const msgWindow = document.getElementsByClassName('msgs')[0]
const user = document.getElementById('user-profile')
const regexName = /^(.*?):/;
const regexMsg = /: (.*)/;

const chooseColor = (userName) => {
  const firstLetter = userName[0].toLowerCase();

  const colorGroups = {
    "color-lightPink": ["a", "e", "y", "s", "h"],
    "color-lightBlue": ["b", "f", "n", "z"],
    "color-lightGreen": ["c", "g", "r", "t"],
    "color-lightYellow": ["d", "j", "m", "v"],
    "color-lightOrange": ["k", "l", "p", "q"],
  };

  let colorClass = "color-lightPink";

  for (const [className, letters] of Object.entries(colorGroups)) {
    if (letters.includes(firstLetter)) {
      colorClass = className;
      break; 
    }
  }

  return colorClass;
};


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
  for (let add of addrs) {
    addrsDiv.innerHTML += `<p>${add}</p>`
  }
}

sendBtn.addEventListener('click', async () => {
  inactiveTime = 0
  const me = await chat.me()
  if (me.peers.length > 0) {
    await chat.msg(textArea.value)
  } else {
    alert("Não há nós conectados na sala")
  }
  textArea.value = ""
})

chat.onMsgReceived((msg) => {
  const matchUser = msg.match(regexName);
  const matchMsg = msg.match(regexMsg);
  const userName = matchUser[1]
  const userColor = chooseColor(userName);
  const message = matchMsg[1]
  const msgWindow = document.getElementsByClassName('msgs')[0]
  msgWindow.innerHTML += `<div class="received-msg"> <p class="msg-user ${userColor}">${userName}: </p> <p class="msg">${message}</p> </div>`
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

chat.onBanned((peer) => {
  if (peer["name"] === name) {
    alert("Você foi banido. Fechando chat em instantes...")
    setTimeout(() => window.close(), 500)
  } else {
    msgWindow.innerHTML += `<div class="received-msg"> <p class="msg">Peer foi banido: <span>${peer["name"]}</span></p> </div>`
  }
})

chat.onChatFull((peer) => {
  if (peer["name"] === name) {
    alert("Não há espaço no chat. Fechando chat em instantes...")
    setTimeout(() => window.close(), 500)
  }
})

chat.onOwnerChanged((isOwner) => {
  if (isOwner) {
    user.innerText = `Olá ${name} - Admin`
  } else {
    user.innerText = `Olá ${name}`
  }
})

const inactiveInterval = setInterval(() => {
  inactiveTime += 2
  if (inactiveTime >= MAX_INACTIVE_TIME) {
    clearInterval(inactiveInterval)
    alert("Chat inativo. Fechando chat em instantes...")
    setTimeout(() => window.close(), 500)
  }
}, 2000)

renderer()
