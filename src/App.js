import React from 'react'
import { DateTime } from 'luxon'
import { MbLayer, MbMap } from '@raumobil/map-react'
import Div100vh from 'react-div-100vh'

const initialBounds = [[8.33417,48.950746],[8.480613,49.0554349]]

function App() {
  const datesArray = []
  const minDate = DateTime.fromFormat('201907120000', 'yyyyMMddHHmm').toMillis()
  const maxDate = Date.now()
  let date = minDate
  while (date < maxDate) {
    datesArray.push(date)
    date = date + 1000 * 60 * 15
  }

  const [timestamp, setTimestamp] = React.useState(minDate)
  const [stepSize, setStepSize] = React.useState(15)

  const [data, setData] = React.useState()
  React.useEffect(() => {
    let newData = _serverData[timestamp]
    if (typeof newData === 'undefined') {
      fetch('https://www.phb23.io/coding/dasfestnextbike_data/' + _getFileName(timestamp))
        .then(response => response.json())
        .then(json => {
          newData = {
            type: 'FeatureCollection',
          }
          let features = []
          Object.keys(json.result).forEach(fc => {
            if (json.result[fc] !== null) {
              features = features.concat(json.result[fc].features.filter(f => f.properties.type === 'bike'))
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

  const [running, setRunning] = React.useState(false)
  React.useEffect(() => {
    if (running) {
      _interval = setInterval(() => {
        _inputRef.stepUp()
        setTimestamp(Number(_inputRef.value))
      }, 200)
    } else {
      clearInterval(_interval)
    }
  }, [running])

  return (
    <div
      className="App"
    >
      <Div100vh style={{
        display: 'flex',
        height: '100rvh',
        flexFlow: 'column',
      }}>
      <div style={{
        flex: 'none',
      }}>
        <p style={{
          textAlign: 'center',
          fontSize: 'larger',
          margin: '5px',
          fontFamily: 'sans-serif'
        }}>
          { _formatDate(timestamp) } | { data ? data.features.length + ' bikes available' : ''}
        </p>
      </div>
      <div
        style={{
          flex: 'auto',
          'WebkitFlex': '1 1 100%', // XXX safari hack
        }}
      >
        { <MbMap
          accessToken="pk.eyJ1IjoicGJvaG5lbnN0ZW5nZWwiLCJhIjoiY2p5MGlicTJsMDJqMjNsbGgzeTZ1cGo0NCJ9.HG5qqanqqOLUF0ykgLMDdQ"
          mbStyle="mapbox://styles/pbohnenstengel/cjy0ihz7o02pq1dqvn7t1x83b"
          bounds={initialBounds}
          onLoad={e => {e._map.resize()}}
        >
          { data && <MbLayer key="circles"
            id="circles"
            paint={{
              'circle-color': 'red',
              'circle-radius': 2,
            }}
            source={{
              type: 'geojson',
              data: data,
            }}
            type='circle'
          /> }
        </MbMap> }
      </div>
      <div style={{
        flex: 'none',
      }}>
        <div style={{
          display: 'flex',
          width: '100vw',
          flexFlow: 'row',
        }}>
          <button
            onClick={() => {
              setRunning(!running)
            }}
            style={{
              height: '25px',
              flex: 'none',
            }}
          >
            <span role="img" aria-label="play/pause">{ running ? '⏸' : '▶️'}</span>
          </button>
          <input type="range"
            min={datesArray[0]}
            max={datesArray[datesArray.length - 1]}
            step={1000 * 60 * stepSize}
            defaultValue={timestamp}
            onInput={event => { setTimestamp(Number(event.currentTarget.value)) }}
            style={{
              height: '20px',
              flex: 'auto',
            }}
            ref={r => { _inputRef = r}}
          />
          <select onChange={event => {setStepSize(Number(event.currentTarget.value))}}>
            <option value={15}>15m</option>
            <option value={30}>30m</option>
            <option value={60}>1h</option>
          </select>
        </div>
      </div>
      </Div100vh>
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

let _interval = false

let _inputRef

export default App;
