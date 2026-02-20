import { useState } from "react";
import SnakeGame from "./SnakeGame";
import TetrisGame from "./TetrisGame";

type Props = {
  playerName?: string;
  siteLabel?: string;
};

type GameKey = "snake" | "tetris";

export default function ArcadeGame({ playerName, siteLabel }: Props) {
  const [game, setGame] = useState<GameKey>("snake");

  const handleSwitchGame = () => {
    setGame((g) => (g === "snake" ? "tetris" : "snake"));
  };

  if (game === "snake") {
    return (
      <SnakeGame
        playerName={playerName}
        siteLabel={siteLabel}
        onSwitchGame={handleSwitchGame}
      />
    );
  }

  return <TetrisGame onSwitchGame={handleSwitchGame} />;
}