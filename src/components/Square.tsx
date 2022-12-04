import { PieceColor, PieceType } from '../util/types';
import Piece from './Piece';
import './Square.css'

interface SquareProps {
  index: number,
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
    <div className={`square ${props.style ?? ""}`} onClick={() => props.onClick(props.index)}>
      {piece}
    </div>
  );
}
  
export default Square;