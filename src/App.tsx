import { useState } from 'react';
import './App.css';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function App() {
  const [FEN, setFEN] = useState(STARTING_FEN);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([]);

  // rewind game state to specified move index
  function onRewind(target: number) {
    setFEN(fenHistory[target]);
    setMoveHistory(moveHistory.slice(0, target));
    setFenHistory(fenHistory.slice(0, target));
  }

  // add a new move to the move history
  function onMove(move: string, FEN: string) {
    setMoveHistory([...moveHistory, move]);
    setFenHistory([...fenHistory, FEN]);
  }

  return (
    <div className='app'>
      <Board FEN={FEN} onMove={onMove} />
      <MoveHistory moves={moveHistory} onRewind={onRewind} />
    </div>
  );
}

export default App;
