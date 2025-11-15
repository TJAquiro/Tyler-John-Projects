import './App.css';
import Greet from './Components/Greet';
import Welcome from './Components/Welcome';
import Helloworld from './Components/HelloWorld';

function App() {
  return (
    <div className="App">
      <Greet></Greet>
      <Welcome/>
      <Helloworld></Helloworld>

    </div>
  );
}

export default App;
