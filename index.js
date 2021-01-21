const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = 3000;

server.listen(3001, () => {
  console.log(`server running on port:${3001}`);
});

const CHANNEL_ID = 'allhands';
const EVENT_ID = 'virtual_space';
const EVENT_ADD_PARTICIPANT = 'add';
const EVENT_UPDATE_PARTICIPANT = 'update';
const EVENT_DELETE_PARTICIPANT = 'delete';

let participants = new Map();

io.on('connection', (socket) => {
  const { channelId } = socket.handshake.query;
  socket.join(channelId);

  // Add a new participant
  socket.on(EVENT_ADD_PARTICIPANT, async (participant) => {
    if (!participants.has(participant.id)) {
      participants.set(participant.id, participant);
    }
    io.to(CHANNEL_ID).emit(EVENT_ID, Array.from(participants, ([, value]) => value));
  });

  socket.on(EVENT_UPDATE_PARTICIPANT, async (participant) => {
    if (participants.has(participant.id)) {
      participants.set(participant.id, participant);
    }
    io.to(CHANNEL_ID).emit(EVENT_ID, Array.from(participants, ([, value]) => value));
  });

  socket.on(EVENT_DELETE_PARTICIPANT, async (participant) => {
    if (participants.has(participant.id)) {
      participants.delete(participant.id);
    }
    io.to(CHANNEL_ID).emit(EVENT_ID, Array.from(participants, ([, value]) => value));
  });
});

app.get('/', (req, res) => {
  const list = Array.from(participants, ([, value]) => value);
  res.status(200).send({ participants: list});
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})