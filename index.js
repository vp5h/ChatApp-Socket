import { Server } from 'socket.io';

const io = new Server(process.env.PORT, {
    cors: {
        origin: process.env.URL || 'http://localhost:3000',
    }, 
})


let users = [];

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) && users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    console.log(users)
    return users.find(user => user.userId === userId);
}
   

io.on('connection',  (socket) => {
    console.log('user connected')

    //connect
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    })

    //send message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
         console.log(users)
        io.to(user.socketId).emit('getMessage', {
            senderId, text
        })
    })
    
    socket.on('sendGMessage', ({ senderId, receiverId, text }) => {
        
        console.log({ senderId, receiverId, text })
        console.log(users)
        for( let i = 0 ; i < receiverId.length; i++){
               users.map((user, index)=>{

                    
                if(user.userId === receiverId[i]){
                   
                    io.to(user.socketId).emit('getGMMessage', {
                        senderId, text
                    })
                }
            })
          
            }
        
       
    })


    //disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    })
})