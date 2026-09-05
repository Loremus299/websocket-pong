import { createId } from "@paralleldrive/cuid2";
import { Result, type Err } from "../utils/result";
import { currentSessions } from "./current-sessions";
import type { Logger } from "../utils/logger";

interface PlayerBody {
  id: string;
  position: number;
}

export class GameSession {
  private players: [PlayerBody, PlayerBody];
  readonly id: string;

  public constructor({
    id1,
    id2,
    log,
  }: {
    id1: string;
    id2: string;
    log: Logger;
  }) {
    log.trace({ layer: "new game session" });
    log.debug({ id1, id2 });
    this.players = [
      { id: id1, position: 0.5 },
      { id: id2, position: 0.5 },
    ];
    this.id = createId();
    log.info({ sessionId: this.id });
    currentSessions.add(this, log);
  }

  get data() {
    return this.players;
  }

  public updatePos({
    id,
    type,
    log,
  }: {
    id: string;
    type: "add" | "sub";
    log: Logger;
  }): Result<number, Err> {
    log.trace({ layer: "update position" });
    log.debug({ id, type });
    const player = this.players.find((i) => i.id == id);
    if (player) {
      if (type === "add") {
        player.position += 0.01;
        return Result.ok(player.position);
      }
      if (type === "sub") {
        player.position -= 0.01;
        return Result.ok(player.position);
      }
      return Result.error({ status: 500, info: "invalid operation provided" });
    }
    log.error({ error: "Player not found in the session" });
    return Result.error({
      status: 404,
      info: "Player not found in the session",
    });
  }
}
