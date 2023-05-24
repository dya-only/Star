import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { useGeolocated } from 'react-geolocated'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
const API_KEY = 'AIzaSyD5jd1PhKwr78AVXuvNkIufDcdMa3HfPCg'

import UserMarker from './assets/usrMarker.png'

function App() {
  const [cafe, setCafe] = useState([] as any)
  const [cafeStatus, setCafeStatus] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState({} as any)
  const [selected, setSelected] = useState(false)

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  })

  const defaultMapOptions = {
    fullscreenControl: false,
    panControl: false,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    overviewMapControl: false
  }

  const containerStyle = { width: '100vw', height: '100vh' }
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  })

  useEffect(() => {
    const getFetch = async () => {
      await axios.get(`/maps/api/place/nearbysearch/json?location=${ coords?.latitude }%2C${ coords?.longitude }&radius=10000&type=cafe&key=AIzaSyD5jd1PhKwr78AVXuvNkIufDcdMa3HfPCg`)
        .then( async (resp) => { 
          console.log(resp.data.results)
          await resp.data.results.forEach((el: { geometry: { location: { lat: number; lng: number } }; name: string }, idx: number) => {
            setCafe((cafe: any) => [...cafe,
              <MarkerF key={idx} onClick={() => { setSelectedMarker(el); setSelected(true); console.log(el) }} position={{ lat: el.geometry.location.lat, lng: el.geometry.location.lng }} />
            ])
          })
          setCafeStatus(true)
        })
      setCafeStatus(true)
    }
    
    getFetch()
  }, [coords])

  return (
      !isGeolocationAvailable ? <div className="">사용자의 위치정보를 받아올 수 없어요!</div> 
      : !isGeolocationEnabled ? <div className="">사용자의 위치정보를 받아올 권한이 없어요!</div>
      : coords && isLoaded ?
        <Fragment>
          { selected === true ?
              <div className='fixed z-50 flex flex-col justify-start items-center rounded-r-[50px] backdrop-blur-xl drop-shadow-2xl bg-white/70 w-[400px] h-screen'>
                { selectedMarker.photos !== null ?
                  <img className='mt-12 w-[300px] h-[250px] object-cover rounded-[20px]' src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${selectedMarker.photos[0].photo_reference}&key=${API_KEY}`} alt='' />
                : null }
                <div className=''>{ selectedMarker.name }</div>
              </div>
          : null }

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: coords?.latitude, lng: coords?.longitude }}
            zoom={15}
            options={defaultMapOptions}
            // onClick={() => { setSelected(false); setSelectedMarker({}) }}
          >
            {/* ME!! */}
            <MarkerF position={{ lat: coords?.latitude, lng: coords?.longitude}} icon={{ url: UserMarker }} />

            { cafeStatus ?
              cafe
            : null }
          </GoogleMap>
        </Fragment>
      : <div className="">맵 데이터를 받아오는중...</div>
  )
}

export default App