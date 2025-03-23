const { Socket } = require("engine.io");
const express = require("express");
const { createServer, METHODS } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT||5001;

const server = createServer(app);
const io = new Server(server, {
  cors: {
     origin: "https://chat-app-108.onrender.com",
  //  origin:" http://localhost:5173",
  },
});


io.on("connection", (socket) => {
  //console.log("User is Connected");

  // Join Room
 
  socket.on("Join-Room", (roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  const roomSize = room ? room.size : 0;

  if (roomSize < 2) {
    socket.join(roomId);
   // console.log(`User ${socket.id} joined room ${roomId}`);

    io.to(roomId).emit("room_update", {
      message: `Joinned Succesfully`,
      status: true,
      usersInRoom: roomSize + 1,
   });
    
    if(roomSize == 1){
    io.to(roomId).emit("live_update", {
       message: `Live`,
    });
  }
  } else {
    socket.emit("room_update", 
      { message: "Room is full. Only 2 users allowed.", 
        status : false,
       });
  }
});

 // Handle user disconnect
 socket.on("disconnecting", () => {
  socket.rooms.forEach((roomId) => {
    socket.to(roomId).emit("room_disconnect", {
      message: `User ${socket.id} left the room.${roomId}`,
    });
  
  });
});

  socket.on("message", (message) => {
    // Send a Message for join Room
    socket.to(message.room).emit("room-message", message);
    //  socket.broadcast.emit("message",message.msg);
  });

  socket.on("revieved-message", (room) => {
    socket.to(room).emit("message-seen", true);
  });
});



server.listen(PORT, () => {
  console.log("Server is running on Port 5001");
});
