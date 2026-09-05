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

wss.on("connection", (ws, _req) => {
  ws.on("message", (data) => {
    const log = new Logger();
    try {
      log.info({ data });
      log.info({ layer: "websocket message" });
      const input = JSON.parse(data.toString());

      log.trace({ op: "body validation" });
      const schema = z.object({
        session: z.string().min(1),
        user: z.string().min(1),
        type: z.enum(["add", "sub"]),
      });
      const values = schema.safeParse(input);
      if (!values.success) {
        return ws.send(
          JSON.stringify({
            error:
              "Invalid body format, requires session, user, type as strings for player1 and player2",
            log: log.id,
          }),
        );
      }
      const { session, user, type } = values.data;

      log.trace({ op: "resolve session" });
      const res = currentSessions.resolve(session, log);
      if (res.isError()) {
        return ws.send(
          JSON.stringify({
            error: res.data.info,
            log: log.id,
          }),
        );
      }
      if (res.isOk()) {
        log.trace({ op: "update position" });
        const activeSession = res.data;
        const pos = activeSession.updatePos({ id: user, type, log });
        if (pos.isError()) {
          return ws.send(
            JSON.stringify({
              error: pos.data.info,
              log: log.id,
            }),
          );
        }

        if (pos.isOk()) {
          return ws.send(JSON.stringify(activeSession.data));
        }
      }
    } finally {
      log.dump();
    }
  });
  ws.on("close", () => {});
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

app.get("/current-sessions", (req, res) => {
  const log = new Logger();
  try {
    log.info({ layer: "GET on /current-sessions" });
    return res.json({ sessions: currentSessions.sessions });
  } finally {
    log.dump();
  }
});

server.listen(5050, () => console.log("Server started"));
