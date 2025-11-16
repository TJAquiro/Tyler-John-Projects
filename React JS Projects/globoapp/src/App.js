import './App.css';
import Greet from './Components/Greet';
import Welcome from './Components/Welcome';
import Helloworld from './Components/HelloWorld';
import Message from './Components/Message';
import Counter from './Components/Counter';

function App() {
  return (
    <div className="App">
      {/* 
      <Greet name = "Tyler" heroname = "superman">
        <p>This is children props</p>
      </Greet>

      <Greet name = "John" heroname = "superman">
        <button>Action</button>
      </Greet>
      <Greet name = "Aquiro" heroname = "superman"/>
      
      <Welcome name = "Tyler" heroname = "superman"/>
      <Helloworld></Helloworld>

      <Message />
      */}

      <Counter />

      <Greet name = "Tyler" heroname = "superman"></Greet>



    </div>
  );
}

export default App;
