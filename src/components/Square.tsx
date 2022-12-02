import Piece, { PieceColor, PieceType } from './Piece';
import './Square.css'

interface SquareProps {
  pieceColor?: PieceColor,
  pieceType?: PieceType,
}

function Square(props: SquareProps) {
  let piece;
  if (props.pieceColor && props.pieceType) {
    piece = <Piece color={props.pieceColor} type={props.pieceType} />
  } else {
    piece = undefined;
  }
  return (
    <div className='square'>
      {piece}
    </div>
  );
}
  
export default Square;