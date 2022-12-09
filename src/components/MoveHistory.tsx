import './MoveHistory.css'
import _ from 'lodash';
import { useState } from 'react';

interface MoveHistoryProps {
  moves: string[],
  onRewind: Function;
  target: number;
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
              <span
                className={`${index * 2 <= props.target ? 'active' : 'inactive'}`}
              >
                {`${index + 1}.`}
              </span>
              <span
                className={`move ${index * 2 <= props.target ? 'active' : 'inactive'}`}
                onClick={() => props.onRewind(index * 2)}
              >
                {movePair[0]}
              </span>
              <span
                className={`move ${index * 2 + 1 <= props.target ? 'active' : 'inactive'}`}
                onClick={() => props.onRewind(index * 2 + 1)}
              >
                {movePair[1] || ""}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
  
export default MoveHistory;