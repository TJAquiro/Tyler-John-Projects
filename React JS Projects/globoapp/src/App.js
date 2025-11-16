import './App.css';
import Greet from './Components/Greet';
import Welcome from './Components/Welcome';
import Helloworld from './Components/HelloWorld';
import Message from './Components/Message';
import Counter from './Components/Counter';
import FunctionClick from './Components/FunctionClick';
import ClassClick from './Components/ClassClick';
import EventBind from './Components/EventBind';

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

      <Counter />

      <Greet name = "Tyler" heroname = "superman"></Greet>

      <Welcome name = "Tyler" heroname = "superman"/>

      <FunctionClick />

      <ClassClick />

      */}
      
      <EventBind />


    </div>
  );
}

export default App;
