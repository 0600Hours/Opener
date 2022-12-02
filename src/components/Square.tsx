import './Square.css'

interface SquareProps {
  style?: string;
}

function Square(props: SquareProps) {
  return (
    <div className={`square ${props.style ?? ""}`}>

    </div>
  );
}
  
export default Square;