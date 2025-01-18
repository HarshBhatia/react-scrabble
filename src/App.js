import "./App.css";
import Draggable from "react-draggable";

const scrabbleBoard = new Array(15).fill(new Array(15).fill(1));

const getRandomLetter = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
};

const tiles = new Array(7).fill(0).map(() => getRandomLetter());

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <h3>Scrabble</h3> */}

        <div id="board">
          {scrabbleBoard.map((row, x) => (
            <div id={`${x}-row`}>
              {row.map((tile, y) => (
                <div id={`${x}-${y}`}>{"    "}</div>
              ))}
            </div>
          ))}
        </div>
        <div id="tiles">
          {tiles.map((tile, tileIndex) => (
            <Draggable
              key={tileIndex}
              // axis="x"
              // handle=".handle"
              // defaultPosition={{ x: 0, y: 0 }}
              // position={null}
              grid={[36, 36]}
              // scale={1}
              // onStart={console.log("handleStart")}
              // onDrag={console.log("handleDrag")}
              // onStop={console.log("handleStop")}
            >
              <div key={tileIndex}>{tile}</div>
            </Draggable>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
