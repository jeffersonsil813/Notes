// ======= MODAL ======= \\
function modal(error) {
    document.querySelector('.modal-overlay').classList.toggle('active')
    document.querySelector('.modal-overlay .modal span').innerText = error
}

// ======= PREVENT DEFAULT ======= \\
document.querySelector("#new-note").addEventListener("click", function (event) {
    event.preventDefault()
})

document.querySelector(".modal a").addEventListener("click", function (event) {
    event.preventDefault()
})

// ======= ON CHANGE INPUTS ======= \\
function onChangeInput() {
    document.querySelector('#btn-options').children[1].classList.remove('disable')
}

// ======= FORMAT DATE ======= \\
function formatDate(date) {
    return date.substring(8) + '/' + date.substring(5, 7) + '/' + date.substring(0, 4)
}

// ======= MIN DATE ======= \\
function minDate() {
    let today = new Date(),
        year = today.getFullYear(),
        month = (today.getMonth() + 1).toString().padStart(2, '0'),
        day = today.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}

// ======= ACESS GITHUB ======= \\
function acessGithub() {
    window.api.send('acessGithub')
}

// ======= ONLOAD MAIN APPEND ======= \\
const Main = {
    main: document.querySelector('main'),
    editMessage() {
        Main.main.innerHTML = ""
        const divEditMessageHtml = document.createElement('div')
        divEditMessageHtml.setAttribute('id', 'edit-notes-message')
        const github = document.createElement('a')
        github.innerHTML = `
        <img src="assets/notes/github.png" alt="github-icon" /> Jefferson Santos
        `
        github.setAttribute('title', 'Github')
        github.setAttribute('onclick', 'acessGithub()')
        github.setAttribute('onmouseover', 'this.children[0].src = "assets/notes/github2.png"')
        github.setAttribute('onmouseout', 'this.children[0].src = "assets/notes/github.png"')

        divEditMessageHtml.appendChild(github)
        Main.main.appendChild(divEditMessageHtml)
    },

    innerHTMLInputNote(index) {
        let aux
        if (index === null || index === undefined) {
            // false -> criando nova nota
            aux = false
        } else {
            // true -> editando nota
            aux = true
        }
        const html = `
            <header>
                <div id="about-note">
                    <input type="text" onkeydown="onChangeInput()" onpaste="onChangeInput()" oninput="onChangeInput()" minlength="5" autocomplete="off" value="${aux === false ? '' : Notes.all[index].title}" placeholder="Título" maxlength="30" id="edit-title"/>
                    
                    <div id="date">
                        <span>Data Término:</span>
                        <input min="${minDate()}" onchange="onChangeInput()" value="${aux === false ? '' : Notes.all[index].date}" type="date" />
                    </div>
                    
                    <div id="radio-area">
                        <span>Prioridade:</span>
                        <input id="low" name="radio" onchange="onChangeInput()" value="Baixa" type="radio" /> <label for="low">Baixa</label>

                        <input id="medium" name="radio" onchange="onChangeInput()" value="Média" type="radio" /> <label for="medium">Média</label>

                        <input id="high" name="radio" onchange="onChangeInput()" value="Alta" type="radio" /> <label for="high">Alta</label>
                    </div>
                </div>

                <div id="btn-options">
                    <button class="btn" title="Cancelar" onclick="Main.editMessage()">Cancelar</button>
                    <button class="btn disable" title="Salvar" onclick="Form.save(${index})">Salvar</button>
                </div>
            </header>

            <textarea name="edit-content" minlength="10" onkeydown="onChangeInput()" onpaste="onChangeInput()" oninput="onChangeInput()" id="edit-content" placeholder="Digite suas anotações">${aux === false ? '' : Notes.all[index].content}</textarea>
        `
        return html
    },

    inputNote(index) {
        Main.main.innerHTML = ""
        const divEditNotes = document.createElement('div')
        divEditNotes.setAttribute('id', 'edit-notes')
        divEditNotes.innerHTML = Main.innerHTMLInputNote(index)

        Main.main.appendChild(divEditNotes)

        if (index != null) {
            if (Notes.all[index].priority == "Baixa") {
                document.querySelector("#radio-area #low").checked = true
            } else if (Notes.all[index].priority == "Média") {
                document.querySelector("#radio-area #medium").checked = true
            } else if (Notes.all[index].priority == "Alta") {
                document.querySelector("#radio-area #high").checked = true
            }
        }

    }
}

// ======= APP ======= \\
const Storage = {
    get() {
        // como salvei o array de notas no local storage como string, preciso converter em um array de objetos novamente para usar o get
        return JSON.parse(localStorage.getItem("notes:notes")) || []
    },

    set(notes) {
        // salvando o array de notas no local storage como string
        localStorage.setItem("notes:notes", JSON.stringify(notes))
    }
}

const Form = {
    getValues() {
        return {
            title: document.querySelector('input#edit-title').value != '' ?
                (document.querySelector('input#edit-title').value[0].toUpperCase() + document.querySelector('input#edit-title').value.substring(1)).trim()
                : '',
            date: document.querySelector('#date input').value,
            content: document.querySelector('textarea#edit-content').value,
            priority: Form.searchRadio()
        }
    },

    searchRadio() {
        const low = document.querySelector('input[type="radio"]:checked')
        const medium = document.querySelector('input[type="radio"]:checked')
        const high = document.querySelector('input[type="radio"]:checked')

        if (low != null && low.value == "Baixa") {
            return document.querySelector('#low').value
        } else if (medium != null && medium.value == "Média") {
            return document.querySelector('#medium').value
        } else if (high != null && high.value == "Alta") {
            return document.querySelector('#high').value
        }

        return ''
    },

    validateFields() {
        const { title, date, content, priority } = Form.getValues()
        if (title.length < 5) {
            throw new Error('O campo título deve conter ao menos 5 caracteres!')
        } else if (date === null || date === undefined || date === "") {
            throw new Error('Por favor, selecione uma data de término!')
        } else if (priority === '') {
            throw new Error('Por favor, selecione um nível de prioridade!')
        } else if (content.length < 10) {
            throw new Error('O campo de anotações deve conter ao menos 10 caracteres!')
        }
    },

    clearFields() {
        document.querySelector('input#edit-title').value = ''
        document.querySelector('textarea#edit-content').value = ''
    },

    save(index) {
        try {
            Form.validateFields()
            const note = Form.getValues()
            Notes.add(index, note)
        } catch (error) {
            modal(error)
        }
    }
}

const Notes = {
    all: Storage.get(),

    add(index, note) {
        // index != null -> estou editando uma nota
        if (index != null) {
            // remove uma nota do array/banco de acordo com o index
            Notes.all.splice(index, 1)
            Notes.all.unshift(note)
        } else {
            // else -> adicionando nova nota
            const { title } = Form.getValues()
            for (let e of Notes.all) {
                if (title.toLowerCase() === e.title.toLowerCase()) {
                    throw new Error('Já existe uma nota com esse título! Por favor, faça uma alteração.')
                }
            }

            // unshift adiciona o elemento na posição [0] do array. O shift remove o elemento [0]
            Notes.all.unshift(note)
        }
        Form.clearFields()
        Main.editMessage()
        App.reload()
    },
    remove(index) {
        Notes.all.splice(index, 1)
        Main.editMessage()
        App.reload()
    },
    edit(index) {
        Main.inputNote(index)
    },

    orderNotes() {
        App.init(document.querySelector("#order-notes").value)
    },

    notify() {
        if (Notes.all.length !== 0) {
            let notes = Notes.all.filter((obj) => {
                return obj.date.length > 0
            })

            function nextDate(a, b) {
                return Number(a.date.replace(/-/g, "")) - Number(b.date.replace(/-/g, ""))
            }
            notes.sort(nextDate)

            function setNotification(element) {
                if (window.Notification && Notification.permission !== "denied") {
                    Notification.requestPermission(() => {
                        let newNotification = new Notification(element.title, {
                            body: "Término: " + formatDate(element.date) + `\nPrioridade: ${element.priority}`,
                            icon: "assets/logo/png/64x64.png"
                        })
                    })
                }
            }

            let aux = 0
            setInterval(() => {
                if (aux < notes.length) {
                    setNotification(notes[aux++])
                } else {
                    clearInterval()
                }
            }, 3600000)
        }
    }
}

const DOM = {
    notesList: document.querySelector('#notes-list'),
    addNote(note, index) {
        const div = document.createElement('div')
        div.setAttribute('class', 'notes-content')
        div.innerHTML = DOM.innerHTMLNote(note, index)
        // passando um index para cada div
        div.dataset.index = index

        DOM.notesList.appendChild(div)
    },

    innerHTMLNote(note, index) {
        const html = `
            <div class="flex">
                <span class="notes-title" title="${note.title}">${note.title.substring(0, 15)}</span>
                <span class="notes-date" title="Data término: ${formatDate(note.date)}">${formatDate(note.date)}</span>
                <div title="Prioridade ${note.priority.toLowerCase()}" class="priority" id="${(note.priority == "Baixa" ? 'low-priority' : (note.priority == "Média" ? 'medium-priority' : (note.priority == "Alta" ? 'high-priority' : '')))}">
                    <img src="./assets/notes/alert.png" alt="alerta" />
                    <span>${note.priority}</span>
                </div>
            </div>
            <div class="options">
                <img src="./assets/notes/edit.png" alt="editar nota" title="Editar/ver nota" onclick="Notes.edit(${index})" />
                <img src="./assets/notes/trash.png" alt="excluir nota" title="Excluir nota" onclick="Notes.remove(${index})" />
            </div>
        `
        return html
    },

    clearNotes() {
        DOM.notesList.innerHTML = ''
    }
}

const App = {
    // control window(electron) - start
    minimize() {
        window.api.send('minimize')
    },
    maximize() {
        window.api.send('maximize')
    },
    quit() {
        window.api.send('quit')
    },
    // control window(electron) - end

    init(value) {
        // Poderia fazer assim
        // Notes.all.forEach(DOM.addNote)

        switch (value) {
            case "Baixa":
                DOM.clearNotes()
                Notes.all.forEach((note, index) => {
                    if (value === "Baixa" && value === note.priority) {
                        DOM.addNote(note, index)
                    }
                })
                break
            case "Média":
                DOM.clearNotes()
                Notes.all.forEach((note, index) => {
                    if (value === "Média" && value === note.priority) {
                        DOM.addNote(note, index)
                    }
                })
                break
            case "Alta":
                DOM.clearNotes()
                Notes.all.forEach((note, index) => {
                    if (value === "Alta" && value === note.priority) {
                        DOM.addNote(note, index)
                    }
                })
                break
            case "Todas":
                DOM.clearNotes()
            default:
                Notes.all.forEach((note, index) => {
                    DOM.addNote(note, index)
                })
        }

        Storage.set(Notes.all)
        setTimeout(() => Notes.notify(), 10000)
        clearTimeout()
    },

    reload() {
        clearInterval()
        DOM.clearNotes()
        App.init(document.querySelector("#order-notes").value)
    }
}

App.init()