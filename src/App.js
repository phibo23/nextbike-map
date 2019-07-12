import React from 'react';

function App() {
  const datesArray = []
  const minDate = Date.parse('2019-07-12 00:00')
  const maxDate = Date.now()
  let date = minDate
  while (date < maxDate) {
    datesArray.push(date)
    date = date + 1000 * 60 * 15
  }

  const [timestamp, setTimestamp] = React.useState(minDate)

  return (
    <div className="App">
      { _formatDate(timestamp) }
      <input type="range"
        min={datesArray[0]}
        max={datesArray[datesArray.length - 1]}
        step={1000 * 60 * 15}
        onInput={event => { setTimestamp(Number(event.currentTarget.value)) }}
        style={{
          width: '100%'
        }}
      />
    </div>
  );
}

const _formatDate = (timestamp) => {
  const d = new Date(timestamp)
  return d.toLocaleString()
}

export default App;
