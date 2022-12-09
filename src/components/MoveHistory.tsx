import './MoveHistory.css'
import _ from 'lodash';

interface MoveHistoryProps {
  moves: string[],
  onRewind: Function;
}

function MoveHistory(props: MoveHistoryProps) {
  return (
    <div className='move-history'>
      <div className='header'>
        Moves
      </div>
      <div className='move-list'>
        {_.chunk(props.moves, 2).map((movePair: string[], index: number) => {
          return (
            <div className='move-pair' key={index}>
              <span>{`${index + 1}.`}</span>
              <span onClick={() => props.onRewind(index * 2)}>{movePair[0]}</span>
              <span onClick={() => props.onRewind(index * 2 + 1)}>{movePair[1] || ""}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
  
export default MoveHistory;