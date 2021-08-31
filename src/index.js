const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', ( socket ) => {
    console.log('New connection')
    socket.on('join', ({ username, room }) => {
        socket.join(room)
        
    //sends broadcast to a specific clients
    socket.emit('message', generateMessage('Welcome'))

    //sends broadcast to all others except this one
   // socket.broadcast.emit('message', generateMessage('A new user joined'))
   //sends broadcast to all others in a room except this one
    socket.broadcast.to(room).emit('message', generateMessage(`${username} joined the room!`))

    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to('B').emit('message', generateMessage(message))
        callback()
    })
    socket.on('sendLocation', (location, callback) => {
        //sends broadcast to all connected clients
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user left'))
    })
})

server.listen(port, ()=>{
    console.log(`server is up on port ${port}`)
})