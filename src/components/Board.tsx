import Square from './Square';
import './Board.css'
import React, { ReactElement, useState } from 'react';
import { XYToIndex } from '../util/util';
import { PieceColor, PieceType, SquareInfo } from '../util/types';

export const BOARD_SIZE = 8;

interface BoardProps {
  FEN: string;
}

function Board(props: BoardProps) {
  const [squares, setSquares] = useState(generateSquares(props.FEN));
  const [lastClickedIndex, setLastClickedIndex] = useState(-1);

  // generate grid of squares from given index
  function generateSquares(FEN: string): SquareInfo[] {
    const squares: SquareInfo[] = [];

    // assign pieces using FEN
    let i = 0
    while (i < FEN.length && FEN.charAt(i) !== ' ') {
      const c = FEN.charAt(i);
      if (c.match(/[1-8]/)) { // blank spaces
        var cNum = parseInt(c);
        while (cNum-- > 0) {
          squares.push({});
        }
      } else if (c.match(/[pbnrqk]/i)) { // piece
        squares.push(
          {
            pieceColor: c === c.toUpperCase() ? PieceColor.White : PieceColor.Black,
            pieceType: c.toUpperCase() as PieceType,
          }
        );
      }
      i++;
    }

    return squares;
  }

  // handle piece movement
  function onSquareClicked(index: number) {
    const newSquares = [...squares];
    const clickedSquare = newSquares[index];
    if (lastClickedIndex === -1 && clickedSquare.pieceColor && clickedSquare.pieceType) { // if we haven't clicked anything and we clicked something with a piece, mark square a clicked
      newSquares[index].style = 'clicked';
      setSquares(newSquares);
      setLastClickedIndex(index);
    } else if (lastClickedIndex !== -1) { // if we've clicked something else, try to move that square to this one
      const prevSquare = newSquares[lastClickedIndex];
      clickedSquare.pieceColor = prevSquare.pieceColor;
      clickedSquare.pieceType = prevSquare.pieceType;
      prevSquare.pieceColor = undefined;
      prevSquare.pieceType = undefined;
      prevSquare.style = "";
      setSquares(newSquares);
      setLastClickedIndex(-1);
    } // nothing happens when we click on a square that doesn't have a piece and haven't already clicked something
  }

  return (
    <div className='board'>
      {[...Array(BOARD_SIZE)].map((e, row) => {
        return (
          <div key={row} className='row'>
            {squares.slice(row * BOARD_SIZE, BOARD_SIZE + row * BOARD_SIZE).map((square, col) => {
              return (
                <Square
                  key={col}
                  index={XYToIndex(col, row)}
                  pieceColor={square.pieceColor}
                  pieceType={square.pieceType}
                  style={square.style}
                  onClick={onSquareClicked}
                />
              );
            })}
          </div>
        )
      })};
    </div>
  );
}
  
export default Board;