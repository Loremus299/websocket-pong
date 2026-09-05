import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("client connected from", req.socket.remoteAddress);
  ws.on("message", (data) => ws.send(`echo: ${data}`));
  ws.on("close", () => console.log("client disconnected"));
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
server.listen(3000);
