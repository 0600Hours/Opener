import Square from './Square';
import './Board.css'
import React, { ReactElement, useState } from 'react';
import { PieceColor, PieceType, SquareInfo } from '../util/types';
import { BOARD_SIZE, coordsToIndex, indexToCoords, stringToIndex } from '../util/util';

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
      tryMovePiece(lastClickedIndex, index);
      setLastClickedIndex(-1);
    } // nothing happens when we click on a square that doesn't have a piece and haven't already clicked something
  }

  // attempt to move a piece from start to end
  function tryMovePiece(startIndex: number, endIndex: number) {
    const newSquares = [...squares];
    const start = squares[startIndex], end = squares[endIndex];
    start.style = ""; // always clear style even if move was invalid

    if (
      start.pieceColor !== end.pieceColor // can't capture your own piece. also prevents double clicking a square
      && !isPieceBetweenSquares(newSquares, startIndex, endIndex) // can't jump over own pieces if moving in cardinatl or diagonal direction
      && isValidEndpoint(start.pieceType, startIndex, endIndex) //
    ) {
      // move piece
      end.pieceColor = start.pieceColor;
      end.pieceType = start.pieceType;
      start.pieceColor = undefined;
      start.pieceType = undefined;
    }

    setSquares(newSquares);
  }

  // check if there are any pieces present between 2 squares
  // only checks if attempting to move in a straight line in a cardinal or diagonal direction
  function isPieceBetweenSquares(squares: SquareInfo[], startIndex: number, endIndex: number): boolean {
    let [startRank, startFile] = indexToCoords(startIndex);
    let [endRank, endFile] = indexToCoords(endIndex);

    // only check for pieces that are on the same rank, file, or diagonal
    if (
      startRank === endRank
      || startFile === endFile
      || startRank + startFile === endRank + endFile
      || startRank - startFile === endRank - endFile
    ) {
      // check intermediate squares for pieces
      let rankDir = 0, fileDir = 0;
      if (startRank !== endRank) {
        rankDir = startRank - endRank < 0 ? 1 : -1;
      }
      if (startFile !== endFile) {
        fileDir = startFile - endFile < 0 ? 1 : -1;
      }
      startRank += rankDir;
      startFile += fileDir;
      while (startRank !== endRank || startFile !== endFile) {
        if (squares[coordsToIndex(startRank, startFile)].pieceType) {
          return true;
        }
        startRank += rankDir;
        startFile += fileDir;
      }
    }

    return false;
  }

  // check if a given piece type could move from the start location to the end location
  function isValidEndpoint(type: PieceType | undefined, startIndex: number, endIndex: number): boolean {
    return true; // TODO: actually validate piece direction
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