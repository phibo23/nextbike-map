import React from 'react'
import { DateTime } from 'luxon'

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

  const [data, setData] = React.useState(_serverData[_getFileName(timestamp)])
  if (typeof data === 'undefined') {
    fetch(_getFileName(timestamp))
      .then(response => response.json())
      .then(json => { setData(json) })
  }

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

const _getFileName = (timestamp) => {
  const d = DateTime.fromMillis(timestamp)
  return d.toFormat('yyyyMMddHHmm') + '.json'
}

const _serverData = {}

export default App;
