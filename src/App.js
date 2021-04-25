// ======= MODAL ======= \\
function modal(error) {
    document.querySelector('.modal-overlay').classList.toggle('active')
    document.querySelector('.modal-overlay .modal span').innerText = error
}

// ======= PREVENT DEFAULT ======= \\
document.querySelector("#new-note").addEventListener("click", function(event){
    event.preventDefault()
  })

document.querySelector(".modal a").addEventListener("click", function(event){
    event.preventDefault()
  })

// ======= DATETIME ======= \\
function dateTime() {
    const date = new Date()
    const day = String(date.getDate().length) == 1? ('0' + date.getDate()) : date.getDate()
    // +1 pq 0=janeiro
    const month = (String(date.getMonth()+1)).length == 1? ('0' + (date.getMonth()+1)) : date.getMonth()+1
    // fullyear (4 dígitos) - year (2 dígitos)
    const year = date.getFullYear()
    const hour = String(date.getHours()).length == 1? ('0' + date.getHours()) : date.getHours()
    const min = String(date.getMinutes()).length == 1? ('0' + date.getMinutes()) : date.getMinutes()

    return day + '/' + month + '/' + year + ' - ' + hour + ':' + min + 'H'
}

// ======= ONLOAD MAIN APPEND ======= \\
const Main = {
    main: document.querySelector('main'),
    editMessage() {
        Main.main.innerHTML = ""
        const divEditMessageHtml = document.createElement('div')
        divEditMessageHtml.setAttribute('id', 'edit-notes-message')
        const span = document.createElement('span')
        span.innerHTML = 'Adicione uma nota ou edite'

        const by = document.createElement('span')
        by.innerHTML = 'by: Jefferson Santos'

        divEditMessageHtml.appendChild(span)
        divEditMessageHtml.appendChild(by)
        Main.main.appendChild(divEditMessageHtml)
    },

    innerHTMLInputNote(index) {
        const html = `
            <header>
                <div id="about-note">
                    <input type="text" minlength="5" autocomplete="off" value="${index == null? '' : Notes.all[index].title}" placeholder="Título" maxlength="30" id="edit-title"/>
                    <span tabindex="-1">${index == null? '' : Notes.all[index].datetime}</span>
                    
                    <div id="radio-area">
                        <span>Prioridade:</span>
                        <input tabindex="-1" id="low" checked="true" name="radio" value="Baixa" type="radio" /> <label for="low">Baixa</label>

                        <input tabindex="-1" id="medium" name="radio" value="Média" type="radio" /> <label for="medium">Média</label>

                        <input tabindex="-1" id="high" name="radio" value="Alta" type="radio" /> <label for="high">Alta</label>
                    </div>
                </div>

                <div id="btn-options">
                    <button tabindex="-1" class="btn" onclick="Main.editMessage()">Cancelar</button>
                    <button tabindex="-1" class="btn" onclick="Form.save(${index})">Salvar</button>
                </div>
            </header>

            <textarea tabindex="0" name="edit-content" minlength="10" id="edit-content" placeholder="Digite suas anotações">${index == null? '' : Notes.all[index].content}</textarea>
        `
        return html
    },

    inputNote(index) {
        Main.main.innerHTML = ""
        const divEditNotes = document.createElement('div')
        divEditNotes.setAttribute('id', 'edit-notes')
        divEditNotes.innerHTML = Main.innerHTMLInputNote(index)

        Main.main.appendChild(divEditNotes)
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
            title: document.querySelector('input#edit-title').value != ''? 
            (document.querySelector('input#edit-title').value[0].toUpperCase() + document.querySelector('input#edit-title').value.substring(1))
            : '',
            datetime: dateTime(),
            content: document.querySelector('textarea#edit-content').value,
            priority: Form.searchRadio()
        }
    },

    searchRadio() {
        const low = document.querySelector('input[type="radio"]:checked')
        const medium = document.querySelector('input[type="radio"]:checked')
        const high = document.querySelector('input[type="radio"]:checked')

        if(low != null && low.value == "Baixa") {
           return document.querySelector('#low').value
        } else if(medium != null && medium.value == "Média") {
            return document.querySelector('#medium').value
        } else if(high != null && high.value == "Alta") {
            return document.querySelector('#high').value
        }

        return ''
    },

    validateFields() {
        const {title, datetime, content, priority} = Form.getValues()
        if(title.trim() === "" || datetime.trim() === "" || content.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        } else if(title.trim().length < 5) {
            throw new Error('O campo título deve conter ao menos 5 caracteres!')
        } else if(content.trim().length < 10) {
            throw new Error('O campo de anotações deve conter ao menos 10 caracteres!')
        } else if(priority === '') {
            throw new Error('Por favor, selecione um nível de prioridade!')
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
        if(index != null) {
            Notes.all.splice(index, 1)
            Notes.all.unshift(note)
        } else {
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
                <span class="notes-title" title="${note.title}">${note.title.substring(0,15)}</span>
                <span class="notes-datetime">${note.datetime}</span>
                <div class="priority" id="${(note.priority == "Baixa"? 'low-priority': (note.priority == "Média"? 'medium-priority': (note.priority == "Alta"? 'high-priority': '') ) )}">
                    <img src="./assets/notes/alert.png" alt="alerta" />
                    <span>${note.priority}</span>
                </div>
            </div>
            <div class="options">
                <img src="./assets/notes/edit.png" alt="editar nota" onclick="Notes.edit(${index})" />
                <img src="./assets/notes/trash.png" alt="excluir nota" onclick="Notes.remove(${index})" />
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

        switch(value) {
            case "Baixa":
                DOM.clearNotes()
                Notes.all.forEach((note, index) => {
                    if(value === "Baixa" && value === note.priority) {
                        DOM.addNote(note, index)
                    }
                })
                break
            case "Média":
                DOM.clearNotes()
                Notes.all.forEach((note, index) => {
                    if(value === "Média" && value === note.priority) {
                        DOM.addNote(note, index)
                    }
                })
                break
            case "Alta":
                DOM.clearNotes()
                Notes.all.forEach((note, index) => {
                    if(value === "Alta" && value === note.priority) {
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
    },

    reload() {
        DOM.clearNotes()
        App.init(document.querySelector("#order-notes").value)
    }
}

App.init()