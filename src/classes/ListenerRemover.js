class ListenerRemover{
    constructor(){
    }

    removeMenuListeners(socket){
        socket.removeAllListeners("join room")
        socket.removeAllListeners("create room")
        socket.removeAllListeners("refresh rooms")
    }

    removeLobbyListeners(socket){
        socket.removeAllListeners("update stats")
        socket.removeAllListeners("player connected to lobby")
        socket.removeAllListeners("update team")
        socket.removeAllListeners("player ready")
    }

    removeSocketListeners(socket){
        socket.removeAllListeners("player input")
        socket.removeAllListeners("game started on client side")
        socket.removeAllListeners("spec info")
        socket.removeAllListeners("spec connected")
    }

    removeListeners(socket){
        socket.removeAllListeners()
    }
}

module.exports = ListenerRemover;