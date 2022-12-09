import { useRef, useState } from 'react';
import './App.css';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// trie structure for storing lines to study
type LineMove = {
  move: string;
  children: LineMove[];
}

function App() {
  const [FEN, setFEN] = useState(STARTING_FEN);
  const [moveHistory, setMoveHistory] = useState<string[]>([]); // FEN strings of all previous moves in this game
  const [fenHistory, setFenHistory] = useState<string[]>([]); // full board FEN strings at each point in the game
  const [moveTarget, setMoveTarget] = useState(0); // which move in the history is currently being shown
  const whiteLines = useRef<LineMove>({ move: '', children: []}) // lines to be learned from white's perspective

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

  // add the current FEN to the lines
  function onNewLine() {
    // TODO: allow study as black too
    insertLine(whiteLines.current, moveHistory.slice(0, moveTarget + 1));
  }

  // given a list of moves, add them to the move trie
  function insertLine(root: LineMove, line: string[]) {
    if (line.length === 0) {
      return;
    }
    // search through children to find next node
    let foundChild = root.children.some(move => {
      if (move.move === line[0]) {
        insertLine(move, line.slice(1));
        return true;
      }
      return false;
    })
    // if we didn't find anthing, make a new child node
    if (!foundChild) {
      root.children.push({ move: line[0], children: [] });
      insertLine(root.children[0], line.slice(1));
    }
  }

  return (
    <div className='app'>
      <div className='board-container'>
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
      <div className = 'button-container'>
        <button type='button' onClick={() => onNewLine()}>
          Add New Line
        </button>
      </div>
    </div>
  );
}

export default App;
