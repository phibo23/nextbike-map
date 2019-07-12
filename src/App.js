import React from 'react'
import { DateTime } from 'luxon'
import { MbMarkerLayer, MbMap } from '@raumobil/map-react'

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

  const [data, setData] = React.useState()
  React.useEffect(() => {
    let newData = _serverData[timestamp]
    if (typeof newData === 'undefined') {
      fetch('../dasfestnextbike_data/' + _getFileName(timestamp))
        .then(response => response.json())
        .then(json => {
          newData = {
            type: 'FeatureCollection',
          }
          let features = []
          Object.keys(json.result).forEach(fc => {
            if (json.result[fc] !== null) {
              features = features.concat(json.result[fc].features)
            }
          })
          newData.features = features
          _serverData[timestamp] = newData
          setData(newData)
        })
        .catch(e => {
          console.log(e)
        })
    } else {
      setData(newData)
    }
  }, [timestamp])

  return (
    <div className="App">
      { _formatDate(timestamp) }
      <div style={{
        height: '90vh'
      }}>
        { data && <MbMap
          accessToken="pk.eyJ1IjoicGJvaG5lbnN0ZW5nZWwiLCJhIjoiY2p5MGlicTJsMDJqMjNsbGgzeTZ1cGo0NCJ9.HG5qqanqqOLUF0ykgLMDdQ"
          mbStyle="mapbox://styles/pbohnenstengel/cjy0ihz7o02pq1dqvn7t1x83b"
          bounds={[[8.33417,48.950746],[8.480613,49.0554349]]}
        >
          <MbMarkerLayer
            id="bikes"
            data={data}
            circleConfig={{
              'circle-radius': 5,
              'circle-color': 'red'
            }}
            smallIconStart={99}
            smallIcon={<div/>}
            largeIcon={<div/>}
          />
        </MbMap> }
      </div>
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
