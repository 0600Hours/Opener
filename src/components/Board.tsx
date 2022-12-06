import Square from './Square';
import './Board.css'
import React, { ReactElement, useState } from 'react';
import { PieceColor, PieceType, SquareInfo } from '../util/types';
import { BOARD_SIZE, coordsToIndex, stringToIndex } from '../util/util';

interface BoardProps {
  FEN: string;
}

function Board(props: BoardProps) {
  const [squares, setSquares] = useState(generateSquares(props.FEN));
  const [lastClickedIndex, setLastClickedIndex] = useState(-1);
  const [activeColor, setActiveColor] = useState(getActiveColor(props.FEN));
  const [castleRights, setCastleRights] = useState(getCastleRights(props.FEN));
  const [EnPassantTarget, setEnPassantTarget] = useState(getEnPassantTarget(props.FEN));

  // generate grid of squares from FEN string
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

  // read who has the current move from FEN string
  function getActiveColor(FEN: string): PieceColor {
    return FEN.split(' ')[1].toUpperCase() as PieceColor;
  }

  // read who has the current move from FEN string
  // format: [WhiteKingside, BlackKingside, WhiteQueenside, BlackQueenside]
  function getCastleRights(FEN: string): boolean[] {
    const castleInfo = FEN.split(' ')[1].toUpperCase();
    return [
      castleInfo.includes('K'),
      castleInfo.includes('k'),
      castleInfo.includes('Q'),
      castleInfo.includes('q'),
    ]
  }

  // read the possible en passant target square from FEN string
  function getEnPassantTarget(FEN: string): number {
    return stringToIndex(FEN.split(' ')[2]);
  }


  // handle piece movement
  function onSquareClicked(index: number) {
    const clickedSquare = squares[index];
    if (lastClickedIndex === -1 && clickedSquare.pieceColor && clickedSquare.pieceType) { // if we haven't clicked anything and we clicked something with a piece, mark square a clicked
      const newSquares = [...squares];
      newSquares[index].style = 'clicked';
      setSquares(newSquares);
      setLastClickedIndex(index);
    } else if (lastClickedIndex !== -1) { // if we've clicked something else, try to move that square to this one
      tryMovePiece(index, lastClickedIndex);
      setLastClickedIndex(-1);
    } // nothing happens when we click on a square that doesn't have a piece and haven't already clicked something
  }

  // attempt to move a piece from start to end
  function tryMovePiece(startIndex: number, endIndex: number) {
    const newSquares = [...squares];
    const start = squares[startIndex], end = squares[endIndex];
    start.style = ""; // always clear style even if move was invalid
    if (
      start.pieceColor !== end.pieceColor // can't capture your own piece
    ) {
      switch (start.pieceType) {
        case PieceType.Pawn:
          break;
        default:
          // ?
      }
    }

    setSquares(newSquares);
  }

  // check if there are any pieces present between 2 squares
  function isPieceBetweenSquares(squares: SquareInfo[], startIndex: number, endIndex: number) {
  }

  return (
    <div className='board'>
      {[...Array(BOARD_SIZE)].map((e, rank) => {
        return (
          <div key={rank} className='row'>
            {squares.slice(rank * BOARD_SIZE, BOARD_SIZE + rank * BOARD_SIZE).map((square, file) => {
              return (
                <Square
                  key={file}
                  index={coordsToIndex(rank, file)}
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