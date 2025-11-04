import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./styles.css";

const socket = io("http://localhost:4000");

export default function App() {
  const [notes, setNotes] = useState({});

  useEffect(() => {
    socket.on("loadNotes", (data) => setNotes(data));

    socket.on("noteCreated", (note) =>
      setNotes((prev) => ({ ...prev, [note.id]: note }))
    );

    socket.on("noteMoved", ({ id, x, y }) =>
      setNotes((prev) => ({
        ...prev,
        [id]: { ...prev[id], x, y }
      }))
    );

    return () => {
      socket.off("loadNotes");
      socket.off("noteCreated");
      socket.off("noteMoved");
    };
  }, []);

  const createNote = () => {
    const id = Date.now().toString();
    const newNote = { id, x: 100, y: 100, text: "Note" };
    socket.emit("createNote", newNote);
  };

  const dragNote = (e, id) => {
    const x = e.clientX - 50;
    const y = e.clientY - 50;
    socket.emit("moveNote", { id, x, y });
  };

  return (
    <div className="board" onDoubleClick={createNote}>
      {Object.values(notes).map((n) => (
        <div
          key={n.id}
          className="note"
          style={{ left: n.x, top: n.y }}
          onMouseDown={(e) => {
            const move = (ev) => dragNote(ev, n.id);
            const up = () => {
              window.removeEventListener("mousemove", move);
              window.removeEventListener("mouseup", up);
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
        >
          {n.text}
        </div>
      ))}
    </div>
  );
}
