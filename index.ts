import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GameSession } from "./classes/game-session";
import z from "zod";
import { Logger } from "./utils/logger";
import { currentSessions } from "./classes/current-sessions";

const app = express();
app.use(express.json());
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
        log: log.id,
      });
    }
    const { id1, id2 } = values.data;

    log.trace({ op: "creating session" });
    const session = new GameSession({ id1, id2, log });
    return res.json({ sessionId: session.id, log: log.id });
  } finally {
    log.dump();
  }
});

app.get("current-sessions", (req, res) => {
  const log = new Logger();
  try {
    log.info({ layer: "GET on /current-sessions" });
    return res.json({ sessions: currentSessions.sessions });
  } finally {
  }
});

server.listen(5050);
