import { useState, useEffect, createContext, useContext } from "react";

/*
  =========================
  REACT FUNDAMENTALS PROJECT
  =========================

  This file intentionally contains MANY concepts in one place
  for teaching purposes. In a real app, you would split this
  into multiple files.

  Think of this file like a Java package that contains:
  - Multiple classes (components)
  - A shared service (context)
*/

/*
  -------------------------
  CONTEXT (Dependency Injection)
  -------------------------

  Context is similar to a Spring @Service that can be accessed
  anywhere without passing it through constructors.
*/

const ThemeContext = createContext("light");

/*
  -------------------------
  ROOT COMPONENT (like main() or @SpringBootApplication)
  -------------------------

  Every React app starts with ONE root component.
*/

export default function App() {
  /*
    useState = managed private field
    React re-renders the component whenever this changes
  */
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState("light");
  const [users, setUsers] = useState([]);

  /*
    useEffect = lifecycle hook
    This runs AFTER the first render

    Java analogy:
      @PostConstruct
  */
  useEffect(() => {
    // Simulate fetching data from an API
    setUsers([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    ]);
  }, []); // Empty dependency array = run once

  /*
    Event handler (like an ActionListener in Java)
  */
  function increment() {
    // NEVER mutate state directly
    // count++ ❌

    // Always use the setter
    setCount(count + 1);
  }

  function addUser(name) {
    setUsers([...users, { id: users.length + 1, name }]);
  }

  function removeUser(id) {
    setUsers(users.filter(user => user.id !== parseInt(id)));
  }



  return (
    /*
      Context Provider makes `theme` available
      to all child components
    */
    <ThemeContext.Provider value={theme}>
      <div style={{ padding: 20 }}>
        <h1>React Fundamentals Demo</h1>

        {/* Props = constructor arguments */}
        <Counter count={count} onIncrement={increment} />

        {/* Conditional rendering */}
        {count >= 5 && <p>You reached 5!</p>}

        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}> 
          Toggle Theme
        </button>

        {/* Lists must use keys (like primary keys) */}
        <UserList users={users} />

        {/* Add user form */}
        <AddUser onAdd={addUser} />
        
        {/* Remove user form */}
        <RemoveUser onRemove={removeUser} users={users} />

        {/* Component consuming context */}
        <ThemeDisplay />
      </div>
    </ThemeContext.Provider>
  );
}

/*
  -------------------------
  CHILD COMPONENT
  -------------------------

  This is like a Java class that receives constructor parameters
*/

function Counter({ count, onIncrement }) {
  /*
    Props are READ-ONLY
    Think: final fields
  */

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={onIncrement}>Increment</button>
    </div>
  );
}

/*
  -------------------------
  LIST RENDERING
  -------------------------
*/

function UserList({ users }) {
  return (
    <div>
      <h3>Users</h3>
      <ul>
        {users.map(user => (
          /*
            key helps React track items efficiently
            Similar to a database primary key
          */
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

function AddUser({ onAdd }) {
  /*
    Local state for the input field
  */
  const [name, setName] = useState(""); 
  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={() => {
        onAdd(name);
        setName("");
      }}>Add User</button>
    </div>
  );
}

function RemoveUser({ onRemove, users }) {
  const [selectedId, setSelectedId] = useState(""); 
  return (
    <div>
      <select
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
      >
        <option value="">Select user to remove</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
      <button onClick={() => {
        if (selectedId) {
          onRemove(selectedId);
          setSelectedId("");
        }
      }}>Remove User</button>
    </div>
  );
}

function ThemeDisplay() {
  /*
    useContext = dependency injection
    No props required
  */
  const theme = useContext(ThemeContext);

  return (
    <p>
      Current theme from context: <strong>{theme}</strong>
    </p>
  );
}
