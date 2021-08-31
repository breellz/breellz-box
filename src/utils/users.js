const users = []

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if( !username || !room ) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing user

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser) {
        return {
            error:'Username already taken'
        }
    }
    //store user

    const user = { id, username, room}
    users.push(user)

    return{ user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}
addUser({
    id:33,
    username: 'brre',
    room: 'der'
})
console.log(users)

const removedUser = removeUser(33)
console.log(removedUser)
console.log(users)