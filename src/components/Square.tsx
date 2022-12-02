import Piece, { PieceColor, PieceType } from './Piece';
import './Square.css'

interface SquareProps {
  x: number,
  y: number,
  onClick: Function,
  pieceColor?: PieceColor,
  pieceType?: PieceType,
  style?: string
}

function Square(props: SquareProps) {
  let piece;
  if (props.pieceColor && props.pieceType) {
    piece = <Piece color={props.pieceColor} type={props.pieceType} />
  } else {
    piece = undefined;
  }
  return (
    <div className={`square ${props.style ?? ""}`} onClick={props.onClick(props.x, props.y, props.pieceColor, props.pieceType)}>
      {piece}
    </div>
  );
}
  
export default Square;