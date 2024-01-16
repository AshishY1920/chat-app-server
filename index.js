const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const port = 8000 || process.env.PORT;

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Api Is Working");
});

const server = http.createServer(app);

const io = socketIo(server);

const users = [];

io.on("connection", (socket) => {
  console.log("New Connection");
  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has Joined`);
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has Joined`,
    });
    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome To The Node JS Chat ${users[socket.id]}`,
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("disconnected", () => {
    socket.broadcast.emit("leave", {
      user: "Admin",
      message: `${users[socket.id]} Has Left The Chat`,
    });
    console.log("User Left");
  });
});

server.listen(port, () => {
  console.log(`Server Is Running on http://localhost:${port}`);
});
