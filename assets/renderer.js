
const sendBtn = document.getElementById('send-btn')
const textArea = document.getElementsByTagName('textarea')[0]
const regexName = /^(.*?):/;
const regexMsg = /: (.*)/;

const renderer = async () => {
  const name = await chat.name()
  const addrs = await chat.addrs()
  const user = document.getElementById('user-profile')
  user.innerText = `Olá ${name}`
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
  const msgWindow = document.getElementsByClassName('msgs')[0]
  msgWindow.innerHTML += `<div class="received-msg"> <p class="msg-user">${userName}: </p> <p class="msg">${message}</p> </div>`
  console.log(`mensagem recebida: ${msg}`)
})


renderer()
