const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', ( socket ) => {
    console.log('New connection')
    socket.emit('message', 'Welcome')

    socket.broadcast.emit('message', 'A new user joined')

    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })
    socket.on('sendLocation', (location) => {
        io.emit('message', `location: ${location.latitude}, ${location.longitude}`)
    })
    socket.on('disconnect', () => {
        io.emit('message', 'A user left')
    })
})

server.listen(port, ()=>{
    console.log(`server is up on port ${port}`)
})