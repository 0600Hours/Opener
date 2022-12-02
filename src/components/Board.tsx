import Square from './Square';
import './Board.css'

function Board() {
  const BOARD_SIZE = 8;
  const squares = new Array(BOARD_SIZE * BOARD_SIZE).fill(<Square />);
  return (
    <div className='board'>
        {squares}
    </div>
  );
}
  
export default Board;