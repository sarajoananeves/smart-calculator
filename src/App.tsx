import './App.css'

function App() {
  return (
      <>
        <h1>My Smart Calculator  🧮</h1>

        <form>
          <div>
            <label htmlFor="numA">First number</label>
            <input id="numA" type="number" />
          </div>

          <div>
            <label htmlFor="op">Operator</label>
            <select id="op">
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">*</option>
              <option value="/">/</option>
            </select>
          </div>

          <div>
            <label htmlFor="numB">Second number</label>
            <input id="numB" type="number" />
          </div>

          <button type="button">Calculate</button>
        </form>

        <p>Result: —</p>
      </>
  )
}

export default App