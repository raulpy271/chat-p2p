
const sendBtn = document.getElementById('send-btn')
const textArea = document.getElementsByTagName('textarea')[0]
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
  const name = await chat.name()
  const addrs = await chat.addrs()
  const user = document.getElementById('user-profile')
  user.innerText = `Olá ${name}`
  const addrsDiv = document.getElementById('addrs')
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
  const userColor = chooseColor(userName);
  const message = matchMsg[1]
  const msgWindow = document.getElementsByClassName('msgs')[0]
  msgWindow.innerHTML += `<div class="received-msg"> <p class="msg-user ${userColor}">${userName}: </p> <p class="msg">${message}</p> </div>`
  console.log(`mensagem recebida: ${msg}`)
})


renderer()
