const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New connection')
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options})

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        //sends broadcast to a specific clients
        socket.emit('message', generateMessage('Admin',`Welcome ${user.username}`))
        //sends broadcast to all others except this one
        // socket.broadcast.emit('message', generateMessage('A new user joined'))
        //sends broadcast to all others in a room except this one
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} joined the room!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })
    socket.on('sendLocation', (location, callback) => {
        //sends broadcast to all connected clients
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {
       const user =  removeUser(socket.id)

       if(user) {
        io.to(user.room).emit('message', generateMessage('Admin', `${user.username} left!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    }
    })
})

server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})