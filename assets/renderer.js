
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

renderer()
