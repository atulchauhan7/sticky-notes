import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

// In-memory notes storage
let notes = {}; // { noteId: { id, x, y, text } }

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send existing notes to newly connected client
  socket.emit("loadNotes", notes);

  // Create Note
  socket.on("createNote", (note) => {
    notes[note.id] = note;
    io.emit("noteCreated", note);
  });

  // Move Note
  socket.on("moveNote", ({ id, x, y }) => {
    if (notes[id]) {
      notes[id].x = x;
      notes[id].y = y;
      io.emit("noteMoved", { id, x, y });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(4000, () => console.log("Server running on :4000"));
