import type { GameSession } from "./game-session";
import { Result, type Err } from "../utils/result";
import type { Logger } from "../utils/logger";

class CurrentSessions {
  readonly sessions: GameSession[];

  public constructor() {
    this.sessions = [];
  }

  public add(session: GameSession) {
    this.sessions.push(session);
  }

  public resolve(id: string, log: Logger): Result<string, Err> {
    const session = this.sessions.find((session) => session.id === id);
    if (session) {
      return Result.ok(session.id);
    } else {
      return Result.error({
        status: 404,
        info: "Session with the provided id doesn't exist",
      });
    }
  }
}

export const currentSessions = new CurrentSessions();
