import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GameSession } from "./classes/game-session";
import { currentSessions } from "./classes/current-sessions";
import z from "zod";
import { Logger } from "./utils/logger";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("client connected from", req.socket.remoteAddress);
  ws.on("message", (data) => ws.send(`echo: ${data}`));
  ws.on("close", () => console.log("client disconnected"));
});

app.post("/new", (req, res) => {
  const log = new Logger();
  try {
    log.info({ layer: "POST on /new" });
    log.info({ body: req.body });

    log.trace({ op: "body validation" });
    const schema = z.object({
      id1: z.string().min(1),
      id2: z.string().min(1),
    });

    const values = schema.safeParse(req.body);
    if (!values.success) {
      return res.status(400).json({
        error:
          "Invalid body format, requires id1 and id2 as strings for player1 and player2",
      });
    }
    const { id1, id2 } = values.data;

    log.trace({ op: "creating session" });
    const session = new GameSession({ id1, id2 });
    return res.json({ sessionId: session.id });
  } finally {
    log.dump();
  }
});

server.listen(3000);
