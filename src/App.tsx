import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { useGeolocated } from 'react-geolocated'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonWalking, faLocationDot, faMugSaucer, faArrowsLeftRight, faCar } from '@fortawesome/free-solid-svg-icons'
const API_KEY = 'AIzaSyD5jd1PhKwr78AVXuvNkIufDcdMa3HfPCg'

import ME from './assets/ME!!.png'
import CAFE from './assets/cafe.png'

function App() {
  const [cafe, setCafe] = useState([] as any)
  const [cafeStatus, setCafeStatus] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState({} as any)
  const [selectedDist, setSelectedDist] = useState({ distance: 0, walking: 0, car: 0 })
  const [selected, setSelected] = useState(false)

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  })

  const mapStyles = [{
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  }]

  const containerStyle = { width: '100vw', height: '100vh' }
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  })

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }
  const getDistance = (origin_lat: number, origin_lng: number, dest_lat: number, dest_lng: number)  => {
    const r = 6371; // 지구의 반지름(km)
    const dLat = deg2rad(dest_lat - origin_lat)
    const dLng = deg2rad(dest_lng - origin_lng)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(origin_lat)) * Math.cos(deg2rad(dest_lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = r * c

    return distance
  }

  const getMarkerInfo = async (el: any) => {
    setSelectedDist({
      distance: Number((getDistance(Number(coords?.latitude), Number(coords?.longitude), Number(el.geometry.location.lat), Number(el.geometry.location.lng)) * 1000).toFixed(0)),
      walking: Number((Number((getDistance(Number(coords?.latitude), Number(coords?.longitude), Number(el.geometry.location.lat), Number(el.geometry.location.lng)) * 1000).toFixed(0)) / 1.3333 / 60).toFixed(0)),
      car: Number((Number((getDistance(Number(coords?.latitude), Number(coords?.longitude), Number(el.geometry.location.lat), Number(el.geometry.location.lng)) * 1000).toFixed(0)) / 6.3 / 60).toFixed(0))
    })

    setSelectedMarker(el)
    setSelected(true)
  }

  useEffect(() => {
    const getFetch = async () => {
      axios.get(`/maps/api/place/nearbysearch/json?location=${ coords?.latitude }%2C${ coords?.longitude }&radius=2000&type=cafe&key=${API_KEY}`)
        .then( async (resp) => { 
          console.log(resp.data.results)
          await resp.data.results.forEach((el: any, idx: number) => {
            if (el.photos != null) {
              setCafe((cafe: any) => [...cafe,
                <MarkerF key={idx} onClick={() => getMarkerInfo(el)} position={{ lat: el.geometry.location.lat, lng: el.geometry.location.lng }} icon={{ url: CAFE }} />
              ])
            }
          })
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
              <div className='fixed z-50 flex justify-center items-start rounded-r-[50px] backdrop-blur-xl drop-shadow-2xl bg-white/70 w-[400px] h-screen'>
                <div className='flex flex-col justify-start items-start'>
                  { selectedMarker.photos !== null ?
                    <img className='mt-12 -ml-[30px] w-[380px] h-[250px] object-cover drop-shadow-xl rounded-r-[50px]' src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${selectedMarker.photos[0].photo_reference}&key=${API_KEY}`} alt='' />
                  : null }
                  <div className='text-3xl font-bold mt-4'>{ selectedMarker.name }</div>
                  <div className='text-lg text-slate-400 mb-8'>{ selectedMarker.vicinity }</div>
                  
                  <div className='w-[310px] h-[80px] rounded-[30px] shadow-lg bg-white/75 flex justify-start items-center mb-4'>
                    <div className='rounded-[30px] bg-white/75 w-[170px] h-[80px] shadow-xl flex justify-center items-center mr-8'>
                      <FontAwesomeIcon className='w-8 h-8 mr-4' icon={faLocationDot} />
                      <FontAwesomeIcon className='w-6 h-6 mr-4' icon={faArrowsLeftRight} />
                      <FontAwesomeIcon className='w-8 h-8' icon={faMugSaucer} />
                    </div>
                    <div className='text-2xl font-bold'>{ selectedDist.distance }m</div>
                  </div>

                  <div className='w-[310px] h-[80px] rounded-[30px] shadow-lg bg-white/75 flex justify-start items-center mb-4'>
                    <div className='rounded-[30px] bg-white/75 w-[80px] h-[80px] shadow-xl flex justify-center items-center mr-8'>
                      <FontAwesomeIcon className='w-10 h-10' icon={faPersonWalking} />
                    </div>
                    <div className='text-2xl font-bold'>{ selectedDist.walking }분</div>
                  </div>

                  <div className='w-[310px] h-[80px] rounded-[30px] shadow-lg bg-white/75 flex justify-start items-center mb-4'>
                    <div className='rounded-[30px] bg-white/75 w-[80px] h-[80px] shadow-xl flex justify-center items-center mr-8'>
                      <FontAwesomeIcon className='w-10 h-10' icon={faCar} />
                    </div>
                    <div className='text-2xl font-bold'>{ selectedDist.car }분</div>
                  </div>
                </div>
              </div>
          : null }

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: coords?.latitude, lng: coords?.longitude }}
            zoom={15}
            options={{ disableDefaultUI: true, styles: mapStyles }}
            onClick={() => { setSelected(false); setSelectedMarker({}) }}
          >
            {/* ME!! */}
            <MarkerF position={{ lat: coords?.latitude, lng: coords?.longitude}} icon={{ url: ME }} />

            { cafeStatus ?  
              cafe
            : null }
          </GoogleMap>
        </Fragment>
      : <div className="">맵 데이터를 받아오는중...</div>
  )
}

export default App