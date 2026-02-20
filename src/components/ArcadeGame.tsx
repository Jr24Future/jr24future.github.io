import { useState } from "react";
import SnakeGame from "./SnakeGame";
import TetrisGame from "./TetrisGame";

type GameKey = "snake" | "tetris";

export default function ArcadeGame() {
  const [game, setGame] = useState<GameKey>("snake");

  const switchGame = () => setGame((g) => (g === "snake" ? "tetris" : "snake"));

  if (game === "snake") {
    return <SnakeGame onSwitchGame={switchGame} />;
  }

  return <TetrisGame onSwitchGame={switchGame} />;
}