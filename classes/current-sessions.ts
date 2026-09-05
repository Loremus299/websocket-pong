import type { GameSession } from "./game-session";
import { Result, type Err } from "../utils/result";
import type { Logger } from "../utils/logger";

class CurrentSessions {
  readonly sessions: GameSession[];

  public constructor() {
    this.sessions = [];
  }

  public add(session: GameSession, log: Logger) {
    log.trace({ layer: "add game session to list" });
    log.debug({ session: session.id });
    this.sessions.push(session);
  }

  public resolve(id: string, log: Logger): Result<GameSession, Err> {
    log.trace({ layer: "resolve session by id" });
    log.debug({ session: id });
    const session = this.sessions.find((session) => session.id === id);
    if (session) {
      log.info({ session: session });
      return Result.ok(session);
    } else {
      log.error({ error: "session not found" });
      return Result.error({
        status: 404,
        info: "Session with the provided id doesn't exist",
      });
    }
  }

  public remove(id: string, log: Logger) {
    log.trace({ layer: "remove game session from list" });
    log.debug({ session: id });
    this.sessions.filter((i) => i.id !== id);
  }
}

export const currentSessions = new CurrentSessions();
