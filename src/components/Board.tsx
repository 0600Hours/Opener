import Square from './Square';
import './Board.css'

function Board() {
  const BOARD_SIZE = 8;
  const squares =
    new Array(BOARD_SIZE).fill(
      new Array(BOARD_SIZE).fill(<Square />)
    );
  return (
    <div className='board'>
        {squares.map(row => {
          return (
            <div className = 'row'>
              {row}
            </div>
          )
        })}
    </div>
  );
}
  
export default Board;