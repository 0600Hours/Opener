import Square from './Square';
import './Board.css'
import { useEffect, useState } from 'react';
import { PieceColor, PieceType, SquareInfo } from '../util/types';
import { BOARD_SIZE, coordsToIndex, fileNumberToName, indexToCoords, indexToString, stringToIndex } from '../util/util';

interface BoardProps {
  FEN: string;
  onMove: Function;
}

function Board(props: BoardProps) {
  // TODO: actually validate the FEN
  const splitFEN = props.FEN.split(' ');
  const [squares, setSquares] = useState(generateSquares(splitFEN[0]));
  const [activeColor, setActiveColor] = useState(getActiveColor(splitFEN[1]));
  const [castleRights, setCastleRights] = useState(getCastleRights(splitFEN[2]));
  const [enPassantTarget, setEnPassantTarget] = useState(getEnPassantTarget(splitFEN[3]));
  const [halfMoves, setHalfMoves] = useState(parseInt(splitFEN[4]));
  const [fullMoves, setFullMoves] = useState(parseInt(splitFEN[5]));
  const [lastClickedIndex, setLastClickedIndex] = useState(-1);
  const [lastMove, setLastMove] = useState("");

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
  // format: [WhiteKingside, WhiteQueenside, BlackKingside, BlackQueenside]
  function getCastleRights(FEN: string): boolean[] {
    return [
      FEN.includes('K'),
      FEN.includes('Q'),
      FEN.includes('k'),
      FEN.includes('q'),
    ];
  }

  // read the possible en passant target square from FEN string
  function getEnPassantTarget(FEN: string): number {
    return FEN === '-' ? -1 : stringToIndex(FEN);
  }

  useEffect(() => {
    if (lastMove && lastMove !== '') {
      props.onMove(lastMove, getFEN());
    }
  }, [lastMove])

  // handle piece movement
  function onSquareClicked(index: number) {
    const clickedSquare = squares[index];
    if (lastClickedIndex === -1 && clickedSquare.pieceColor === activeColor && clickedSquare.pieceType) { // if we haven't clicked anything and we clicked something with a piece, mark square a clicked
      const newSquares = [...squares];
      newSquares[index].style = 'clicked';
      setSquares(newSquares);
      setLastClickedIndex(index);
    } else if (lastClickedIndex !== -1) { // if we've clicked something else, try to move that square to this one
      const moveName = tryMovePiece(lastClickedIndex, index);
      if (moveName !== "") {
        const [startRank, startFile] = indexToCoords(lastClickedIndex);
        const [endRank, endFile] = indexToCoords(index);
        setActiveColor(activeColor === PieceColor.White ? PieceColor.Black : PieceColor.White);
        setLastMove(moveName);
        
        // update other board state variables
        let newEnPassantTarget = -1;
        switch (clickedSquare.pieceType) {
          case PieceType.King: // king move removes both castle rights
            const newRights = [...castleRights];
            newRights[clickedSquare.pieceColor === PieceColor.White ? 0 : 1] = false;
            newRights[clickedSquare.pieceColor === PieceColor.White ? 2 : 3] = false;
            setCastleRights(newRights);
            break;
          case PieceType.Rook: // rook move removes just 1
            if ( // only need to remove the castle rights if we're moving from a corner of the board
              (startRank === 0 || startRank === BOARD_SIZE - 1)
              && (startFile === 0 || startRank === BOARD_SIZE - 1)
            ) {
              let rightsIndex = -1;
              if (clickedSquare.pieceColor === PieceColor.White && startRank === BOARD_SIZE - 1) { // white rook moving from bottom corner
                rightsIndex = startFile === 0 ? 1 : 0;
              } else if (clickedSquare.pieceColor === PieceColor.Black && startRank === 0) { // black rook moving from top corner
                rightsIndex = startFile === 0 ? 3 : 2;
              }
              if (rightsIndex !== -1) {
                const newRights = [...castleRights];
                newRights[rightsIndex] = false;
                setCastleRights(newRights)
              }
            }
            break;
          case PieceType.Pawn: // set en passant target square
            if (Math.abs(startRank - endRank) === 2) {
              const targetRank = clickedSquare.pieceColor === PieceColor.White ? endRank + 1 : endRank - 1; // target is 1 square behind pawn
              newEnPassantTarget = coordsToIndex(targetRank, endFile);
            }
        }
        setEnPassantTarget(newEnPassantTarget);
        setHalfMoves(halfMoves + 1);
        if (activeColor === PieceColor.White) {
          setFullMoves(fullMoves + 1);
        }
      }
      setLastClickedIndex(-1);
    } // nothing happens when we click on a square that doesn't have a piece and haven't already clicked something
  }

  // attempt to move a piece from start to end. returns move name if move was successful
  function tryMovePiece(startIndex: number, endIndex: number): string {
    let moveName = "";
    const newSquares = [...squares];
    const [startRank, startFile] = indexToCoords(startIndex);
    const [endRank, endFile] = indexToCoords(endIndex);
    const start = squares[startIndex], end = squares[endIndex];
    start.style = ""; // always clear style even if move was invalid

    // check if this move is legal TODO: ensure active player is not putting themselves in check
    if (
      start.pieceColor !== end.pieceColor // can't capture your own piece. also prevents double clicking a square
      && start.pieceColor === activeColor // can only move if it's your turn
      && !isPieceBetweenSquares(newSquares, startIndex, endIndex) // can't jump over own pieces if moving in cardinal or diagonal direction
      && isValidEndpoint(newSquares, startIndex, endIndex) // ensure the piece can actually move like that
    ) {
      // generate move name
      const isCapture = end.pieceType || (start.pieceType === PieceType.Pawn && endIndex === enPassantTarget);
      moveName = `${start.pieceType !== PieceType.Pawn ? start.pieceType : ""}${isCapture ? 'x' : ""}${indexToString(endIndex).toLowerCase()}`;
      if (start.pieceType === PieceType.Pawn && isCapture) {
        moveName = `${fileNumberToName(startFile).toLowerCase()}${moveName}`;
      }

      // move piece
      end.pieceColor = start.pieceColor;
      end.pieceType = start.pieceType;
      start.pieceColor = undefined;
      start.pieceType = undefined;
      if (end.pieceType === PieceType.King && Math.abs(startIndex - endIndex) === 2) { // move rook too if we just castled
        const isKingSide = startIndex < endIndex;
        moveName = isKingSide ? "O-O" : "O-O-O";
        const rookStartSquare = newSquares[coordsToIndex(endRank, isKingSide ? BOARD_SIZE - 1 : 0)];
        const rookEndSquare = newSquares[coordsToIndex(endRank, isKingSide ? endFile - 1 : endFile + 1)];
        rookEndSquare.pieceType = PieceType.Rook;
        rookEndSquare.pieceColor = rookStartSquare.pieceColor;
        rookStartSquare.pieceType = undefined;
        rookStartSquare.pieceColor = undefined;
      } else if (end.pieceType === PieceType.Pawn && endIndex === enPassantTarget) { // remove captured en passant pawn
        const capturedSquare = newSquares[coordsToIndex(startRank, endFile)]
        capturedSquare.pieceColor = undefined;
        capturedSquare.pieceType = undefined;
      }
    }

    setSquares(newSquares);
    return moveName;
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
          || (Math.abs(startRank - endRank) === 1 && Math.abs(startFile - endFile) === 2);
      case PieceType.Rook: //only orthogonal moves
        return startRank === endRank || startFile === endFile;
      case PieceType.Queen: // diagonal or orthogonal moves
        return startRank === endRank
          || startFile === endFile
          || startRank + startFile === endRank + endFile
          || startRank - startFile === endRank - endFile;
      case PieceType.King: // diagonal or orthogonal, but only 1 step
        // TODO: check for castling through check, though perhaps not in this function
        // TODO: ensure nothing is in the way of the rook as well as the king
        return (
          (Math.abs(startRank - endRank) <= 1 && Math.abs(startFile - endFile)) <= 1) // basic movement
          || (
            startRank === endRank && ( // castling
              (startFile - endFile === 2 && castleRights[color === PieceColor.White ? 1 : 3]) // queenside castling
              || (startFile - endFile === -2 && castleRights[color === PieceColor.White ? 0 : 2]) // kingside castling
            )
          );
      default: 
        return false; // if we've somehow gotten a piece without a type, at least don't try to move it
    }
  }

  // get the FEN string for the current board
  function getFEN(): string {
    const pieceString = squares
      .map(sq => {
        if (!sq.pieceColor || !sq.pieceType) {
          return "";
        }
        return sq.pieceColor === PieceColor.White ? sq.pieceType.toString() : sq.pieceType.toString().toLowerCase();
      })
      .reduce((prev, curr, index, arr) => {
        const slash = index !== arr.length - 1 && (index + 1) % BOARD_SIZE === 0 ? '/' : "";
        let pieceString = curr;
        if (curr === "") { // accumulate blank squares together
          if (index === 0 || Number.isNaN(parseInt(prev.charAt(prev.length - 1)))) {
            pieceString = "1";
          } else {
            // increment last character of string
            pieceString = `${parseInt(prev.charAt(prev.length - 1)) + 1}`;
            prev = prev.slice(0, prev.length - 1);
          }
        }
        return `${prev}${pieceString}${slash}`;
      });

    const activeString = activeColor.toString().toLowerCase();

    let castleString = `${castleRights[0] ? 'K' : ''}${castleRights[1] ? 'Q' : ''}${castleRights[2] ? 'k' : ''}${castleRights[3] ? 'q' : ''}`
    if (castleString === '') {
      castleString = '-';
    }
    const enPassantString = enPassantTarget === -1 ? '-' : indexToString(enPassantTarget);

    return `${pieceString} ${activeString} ${castleString} ${enPassantString} ${halfMoves} ${fullMoves}`;
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