import Square from './Square';
import './Board.css'
import { importAll } from '../util/util';
import { ReactElement, useState } from 'react';
import { PieceColor, PieceType } from './Piece';

interface BoardProps {
  FEN: string;
}

// generate grid of squares from given index
function generateSquares(FEN: string): ReactElement[][] {
  const squares: ReactElement[][] = [[]];

  // assign pieces using FEN
  let i = 0, rowIndex = 0;
  while (i <FEN.length && FEN.charAt(i) !== ' ') {
    const c = FEN.charAt(i);
    if (c.match(/[1-8]/)) { // blank spaces
      var cNum = parseInt(c);
      while (cNum-- > 0) {
        squares[rowIndex].push(<Square />)
      }
    } else if (c === '/') { // next row
      squares.push([]);
      rowIndex++;
    } else { // piece
      const pieceColor: PieceColor = c === c.toUpperCase() ? PieceColor.Black : PieceColor.White;
      const pieceType: PieceType = c.toUpperCase() as PieceType;
      squares[rowIndex].push(<Square pieceColor={pieceColor} pieceType={pieceType} />)
    }
    i++;
  }

  return squares;
}


function Board(props: BoardProps) {
  const BOARD_SIZE = 8;
  const [squares, setSquares] = useState(generateSquares(props.FEN));

  return (
    <div className='board'>
        {squares.map((row, index) => {
          return (
            <div key={BOARD_SIZE - index} className='row'>
              {row}
            </div>
          )
        })}
    </div>
  );
}
  
export default Board;