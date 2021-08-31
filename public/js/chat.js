const socket = io()
//Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container

    const containerHeight = $messages.scrollHeight

    //How far have I scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight

    if ( containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }


}

//message handler
socket.on('message', (message)=> {
        console.log(message)
        const html = Mustache.render(messageTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoScroll()
})
//location handler

socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        createdAt: moment(locationMessage.createdAt).format('h:mm a'),
        url: locationMessage.url
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    
    socket.emit('sendMessage', message, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('message was delivered')
    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords
        socket.emit('sendLocation', { latitude, longitude }, () => {
            console.log('location shared')
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})