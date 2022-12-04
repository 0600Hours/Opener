import { PieceType, PieceColor } from '../util/types';
import './Piece.css'

interface PieceProps {
  type: PieceType,
  color: PieceColor,
}

function Piece(props: PieceProps) {
  // piece images are formatted like {piecetype}{piececolor}.png
  return (
    <div className='piece'>
      <img src={require(`../img/${props.type}${props.color}.png`)} />
    </div>
  );
}
  
export default Piece;