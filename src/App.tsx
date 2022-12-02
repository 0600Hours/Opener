import React from 'react';
import './App.css';
import Board from './components/Board';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function App() {
  return (
    <div>
      <Board FEN={STARTING_FEN}/>
    </div>
  );
}

export default App;
