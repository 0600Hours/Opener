import { importAll } from '../util/util';
import './Piece.css'

// import piece from from piece library
const pieceImages = importAll(require.context('../img/', false, /\.png$/)) ;

export enum PieceType {
    Pawn = 'P',
    Knight = 'N',
    Bishop = 'B',
    Rook = 'R',
    Queen = 'Q',
    King = 'K',
}

export enum PieceColor {
    Black = 'B',
    White = 'W',
}

interface PieceProps {
  type: PieceType,
  color: PieceColor,
}

function Piece(props: PieceProps) {
  // piece images are formatted like {piecetype}{piececolor}.png
  return (
    <div className='piece'>
      <img src={pieceImages[`${props.type}${props.color}`]} />
    </div>
  );
}
  
export default Piece;