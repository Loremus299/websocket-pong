import { Result, type Err } from "../utils/result";
import { currentSessions } from "./current-sessions";

interface PlayerBody {
  id: string;
  position: number;
}

export class GameSession {
  private players: [PlayerBody, PlayerBody];
  readonly id: string;

  public constructor({ id1, id2 }: { id1: string; id2: string }) {
    this.players = [
      { id: id1, position: 0.5 },
      { id: id2, position: 0.5 },
    ];
    this.id = "1234";
    currentSessions.add(this);
  }

  public updatePos({
    id,
    type,
  }: {
    id: string;
    type: "add" | "sub";
  }): Result<number, Err> {
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
    return Result.error({
      status: 404,
      info: "Player not found in the session",
    });
  }
}
