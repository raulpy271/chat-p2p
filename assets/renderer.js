
const sendBtn = document.getElementById('send-btn')
const textArea = document.getElementsByTagName('textarea')[0]

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
  const msgWindow = document.getElementsByClassName('msgs')[0]
  msgWindow.innerHTML += `<p class="msg">${msg}</p>`
  console.log(`mensagem recebida: ${msg}`)
})


renderer()
