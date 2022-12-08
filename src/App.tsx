import './App.css';
import Board from './components/Board';
import MoveHistory from './components/MoveHistory';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function App() {
  // rewind game state to specified move index
  function onRewind(target: number) {
    // TODO: slice move list to target index
  }

  // add a new move to the move history
  function onMove(move: string) {
    // TODO: add move to move list
  }

  return (
    <div className='app'>
      <Board FEN={STARTING_FEN} onMove={onMove} />
      <MoveHistory moves={['e4', 'e5', 'Nf6', 'Nf3', 'Bc4']} onRewind={onRewind} />
    </div>
  );
}

export default App;
