import { useState } from 'react';
import './App.css';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function App() {
  const [FEN, setFEN] = useState(STARTING_FEN);
  const [moveHistory, setMoveHistory] = useState<string[]>([]); // FEN strings of all previous moves in this game
  const [fenHistory, setFenHistory] = useState<string[]>([]); // full board FEN strings at each point in the game
  const [moveTarget, setMoveTarget] = useState(0); // which move in the history is currently being shown

  // rewind game state to specified move index
  function onRewind(target: number) {
    setFEN(fenHistory[target]);
    setMoveTarget(target);
  }

  // add a new move to the move history
  function onMove(move: string, FEN: string) {
    if (moveTarget < moveHistory.length) { // if we'd rewound history, continue from that position
      setMoveHistory([...moveHistory.slice(0, moveTarget + 1), move]);
      setFenHistory([...fenHistory.slice(0, moveTarget + 1), FEN]);
    } else {
      setMoveHistory([...moveHistory, move]);
      setFenHistory([...fenHistory, FEN]);
    }
    setMoveTarget(moveTarget + 1);
  }

  return (
    <div className='app'>
      <Board
        FEN={FEN}
        onMove={onMove}
        key={FEN}
      />
      <MoveHistory
        moves={moveHistory}
        onRewind={onRewind}
        target={moveTarget}
      />
    </div>
  );
}

export default App;
