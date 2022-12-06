import Square from './Square';
import './Board.css'
import { useState } from 'react';
import { PieceColor, PieceType, SquareInfo } from '../util/types';
import { BOARD_SIZE, coordsToIndex, indexToCoords, stringToIndex } from '../util/util';

interface BoardProps {
  FEN: string;
}

function Board(props: BoardProps) {
  const splitFEN = props.FEN.split(' ');
  const [squares, setSquares] = useState(generateSquares(splitFEN[0]));
  const [lastClickedIndex, setLastClickedIndex] = useState(-1);
  const [activeColor, setActiveColor] = useState(getActiveColor(splitFEN[1]));
  const [castleRights, setCastleRights] = useState(getCastleRights(splitFEN[2]));
  const [enPassantTarget, setEnPassantTarget] = useState(getEnPassantTarget(splitFEN[3]));

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
    return FEN.toUpperCase() as PieceColor;
  }

  // read who has the current move from FEN string
  // format: [WhiteKingside, BlackKingside, WhiteQueenside, BlackQueenside]
  function getCastleRights(FEN: string): boolean[] {
    return [
      FEN.includes('K'),
      FEN.includes('k'),
      FEN.includes('Q'),
      FEN.includes('q'),
    ]
  }

  // read the possible en passant target square from FEN string
  function getEnPassantTarget(FEN: string): number {
    return stringToIndex(FEN);
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
      const wasPieceMoved = tryMovePiece(lastClickedIndex, index);
      if (wasPieceMoved) { // update active color
        setActiveColor(activeColor === PieceColor.White ? PieceColor.Black : PieceColor.White);
      }
      setLastClickedIndex(-1);
    } // nothing happens when we click on a square that doesn't have a piece and haven't already clicked something
  }

  // attempt to move a piece from start to end. returns true if the piece was successfully moved;
  function tryMovePiece(startIndex: number, endIndex: number): boolean {
    let wasPieceMoved = false;
    const newSquares = [...squares];
    const start = squares[startIndex], end = squares[endIndex];
    start.style = ""; // always clear style even if move was invalid

    // check if this move is legal TODO: ensure active player is not putting themselves in check
    if (
      start.pieceColor !== end.pieceColor // can't capture your own piece. also prevents double clicking a square
      && start.pieceColor === activeColor // can only move if it's your turn
      && !isPieceBetweenSquares(newSquares, startIndex, endIndex) // can't jump over own pieces if moving in cardinatl or diagonal direction
      && isValidEndpoint(newSquares, startIndex, endIndex) //
    ) {
      // move piece
      end.pieceColor = start.pieceColor;
      end.pieceType = start.pieceType;
      start.pieceColor = undefined;
      start.pieceType = undefined;
      if (end.pieceType === PieceType.King && Math.abs(startIndex - endIndex) === 2) { // move rook too if we just castled
        const isKingSide = startIndex < endIndex;
        const [kingRank, kingFile] = indexToCoords(endIndex);
        const rookStartSquare = newSquares[coordsToIndex(kingRank, isKingSide ? BOARD_SIZE - 1 : 0)];
        const rookEndSquare = newSquares[coordsToIndex(kingRank, isKingSide ? kingFile - 1 : kingFile + 1)];
        rookEndSquare.pieceType = PieceType.Rook;
        rookEndSquare.pieceColor = rookStartSquare.pieceColor;
        rookStartSquare.pieceType = undefined;
        rookStartSquare.pieceColor = undefined;
      }
      wasPieceMoved = true;
    }

    setSquares(newSquares);
    return wasPieceMoved;
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
  function isValidEndpoint(squares: SquareInfo[], startIndex: number, endIndex: number): boolean {
    const [startRank, startFile] = indexToCoords(startIndex);
    const [endRank, endFile] = indexToCoords(endIndex);
    const type = squares[startIndex].pieceType;
    const color = squares[startIndex].pieceColor;
    switch (type) {
      case PieceType.Pawn: // 1 step forward, or 2 steps from initial rank. only captures diagonally 1 step
        const colorMod = color === PieceColor.White ? 1 : -1; // white pawns go up, black pawns go down
        return (
          ( // standard forward movement
            startFile === endFile
            && squares[endIndex].pieceType === undefined // pawns can't capture forward
            && (
              startRank - endRank === colorMod // 1 step forward
              || ( // 2 steps forward from the starting rank
                startRank === (colorMod * ((BOARD_SIZE - 3) / 2)) + (BOARD_SIZE - 1) / 2 // if BOARD_SIZE is 8 this comes out to either 6 or 1
                && startRank - endRank === 2 * colorMod
              )
            )
          )
          || ( // diagonal capturing
            Math.abs(startFile - endFile) === 1
            && startRank - endRank === colorMod
            && (
              (squares[endIndex].pieceColor !== undefined && squares[endIndex].pieceColor !== color) // capturing enemy piece
              || endIndex === enPassantTarget // en passant
            )
          )
        );
      case PieceType.Bishop: // only diagonal moves
        return startRank + startFile === endRank + endFile || startRank - startFile === endRank - endFile;
      case PieceType.Knight: // 2 steps in 1 direction, then 1 step in another
        return (Math.abs(startRank - endRank) === 2 && Math.abs(startFile - endFile) === 1)
          || (Math.abs(startRank - endRank) === 1 && Math.abs(startFile - endFile) === 2)
      case PieceType.Rook: //only orthogonal moves
        return startRank === endRank || startFile === endFile
      case PieceType.Queen: // diagonal or orthogonal moves
        return startRank === endRank
          || startFile === endFile
          || startRank + startFile === endRank + endFile
          || startRank - startFile === endRank - endFile
      case PieceType.King: // diagonal or orthogonal, but only 1 step
        // TODO: check for castling through check, though perhaps not in this function
        // TODO: ensure nothing is in the way of the rook as well as the king
        return (
          (Math.abs(startRank - endRank) <= 1 && Math.abs(startFile - endFile)) <= 1) // basic movement
          || (
            startRank === endRank && ( // castling
              (startFile - endFile === 2 && castleRights[color === PieceColor.White ? 2 : 3]) // queenside castling
              || (startFile - endFile === -2 && castleRights[color === PieceColor.White ? 0 : 1]) // kingside castling
            )
          )
      default: 
        return false; // if we've somehow gotten a piece without a type, at least don't try to move it
    }
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