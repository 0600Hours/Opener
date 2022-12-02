import Square from './Square';
import './Board.css'
import React, { ReactElement, useEffect, useState } from 'react';
import { PieceColor, PieceType } from './Piece';
import { cp } from 'fs';

interface BoardProps {
  FEN: string;
}

function Board(props: BoardProps) {
  const BOARD_SIZE = 8;
  const [squares, setSquares] = useState(generateSquares(props.FEN));
  const [clickedSquare, setClickedSquare] = useState<ReactElement | undefined>();

  // generate grid of squares from given index
  function generateSquares(FEN: string): ReactElement[][] {
    const squares: ReactElement[][] = [[]];

    // assign pieces using FEN
    let i = 0, y = 0, x = 0;
    while (i < FEN.length && FEN.charAt(i) !== ' ') {
      const c = FEN.charAt(i);
      console.log(c);
      if (c.match(/[1-8]/)) { // blank spaces
        var cNum = parseInt(c);
        while (cNum-- > 0) {
          squares[y].push(
            <Square 
              x={x++}
              y={y}
              onClick={onSquareClicked} 
            />
        );
        }
      } else if (c === '/') { // next row
        squares.push([]);
        y++;
        break;
      } else { // piece
        const pieceColor: PieceColor = c === c.toUpperCase() ? PieceColor.Black : PieceColor.White;
        const pieceType: PieceType = c.toUpperCase() as PieceType;
        squares[y].push(
          <Square
            x={x++}
            y={y}
            pieceColor={pieceColor}
            pieceType={pieceType}
            onClick={onSquareClicked}
          />
        );
      }
      i++;
    }

    return squares;
  }

  // handle piece movement
  function onSquareClicked(x: number, y: number, color: PieceColor, type: PieceType) {
    if (!clickedSquare && color && type) { // if we haven't clicked anything and we clicked something with a piece, mark square a clicked
      squares[y][x] =
        <Square // style square to be clicked
          x={x}
          y={y}
          pieceColor={color}
          pieceType={type}
          onClick={onSquareClicked}
          style={'clicked'}
        />
      setClickedSquare(squares[y][x]);
    } else if (clickedSquare) { // if we've clicked something else, try to move that square to this one
      const prevProps = clickedSquare.props;
      squares[prevProps.y][prevProps.x] =
        <Square // blank out previously clicked square
          x={prevProps.x}
          y={prevProps.y}
          onClick={onSquareClicked}
        />
      squares[y][x] =
        <Square // move piece on previously clicked square to this one
          x={x}
          y={y}
          pieceColor={prevProps.pieceColor}
          pieceType={prevProps.pieceType}
          onClick={onSquareClicked}
        />
    } // nothing happens when we click on a square that doesn't have a piece and havent already clicked something
  } 

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