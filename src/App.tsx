import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { useGeolocated } from 'react-geolocated'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonWalking, faLocationDot, faMugSaucer, faArrowsLeftRight, faCar, faStar } from '@fortawesome/free-solid-svg-icons'
const API_KEY = 'AIzaSyD5jd1PhKwr78AVXuvNkIufDcdMa3HfPCg'

import ME from './assets/ME!!.png'
import CAFE from './assets/cafe.png'
// import Star from './assets/star-solid.svg'
import EmptyStar from './assets/star-regular.svg'

function App() {
  const [cafe, setCafe] = useState([] as any)
  const [cafeStatus, setCafeStatus] = useState(false)
  const [selected, setSelected] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState({} as any)
  const [selectedDist, setSelectedDist] = useState({ distance: 0, walking: 0, car: 0 })

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
          { selected ? 
            <div className='fixed z-30 w-screen h-screen bg-black/25 lg:hidden md:hidden' onClick={() => { setSelected(false); setSelectedMarker({})} } />
          : null }
          { selected ?
              <div className='overflow-y-auto fixed z-50 flex justify-center items-start lg:rounded-r-[50px] md:rounded-r-[50px] lg:rounded-t-none md:rounded-t-none rounded-t-[50px] backdrop-blur-xl shadow-2xl bg-white/70 md:w-[400px] lg:w-[400px] w-screen lg:h-screen md:h-screen h-[80%] mt-[45%] lg:mt-0 md:mt-0'>
                <div className='flex flex-col justify-start items-center'>
                  <img className='lg:mt-12 md:mt-12 lg:-ml-[30px] md:-ml-[30px] lg:w-[380px] md:w-[380px] w-screen h-[250px] object-cover drop-shadow-xl lg:rounded-r-[50px] md:rounded-r-[50px] rounded-[50px]' src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${selectedMarker.photos[0].photo_reference}&key=${API_KEY}`} alt='' />
                  <div className='flex justify-center items-center mt-4'>
                    <div className='text-3xl font-bold mr-4 w-[220px]'>{ selectedMarker.name }</div>
                    { selectedMarker.opening_hours.open_now ?
                      <div className="p-2 rounded-xl shadow-lg bg-white text-green-400 flex justift-center items-center">
                        <div className='rounded-full w-4 h-4 mr-2 bg-green-400'/> 영업중
                      </div>
                    : <div className="p-2 rounded-xl shadow-lg bg-white text-grey-400 flex justift-center items-center">
                        <div className='rounded-full w-4 h-4 mr-2 bg-grey-400'/> 문닫음
                      </div> }
                  </div>
                  <div className='text-lg w-[315px] text-slate-400 mb-8'>{ selectedMarker.vicinity }</div>
                  
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

                  <div className='w-[310px] h-[80px] rounded-[30px] shadow-lg bg-white/75 flex justify-start items-center mb-12'>
                    <div className='rounded-[30px] bg-white/75 w-[80px] h-[80px] shadow-xl flex justify-center items-center mr-8'>
                      <FontAwesomeIcon className='w-10 h-10' icon={faCar} />
                    </div>
                    <div className='text-2xl font-bold'>{ selectedDist.car }분</div>
                  </div>

                  <button className='w-[150px] h-[50px] flex justify-center items-center font-bold p-2 shadow-xl bg-white/90 rounded-xl lg:mb-0 md:mb-0 mb-12'>
                    <img className='star w-6 h-6 mr-2' src={EmptyStar} alt="" />
                    즐겨찾기 추가
                  </button>
                </div>
              </div>
          : null }

          <div className='fixed z-30 lg:w-[98.5%] w-[95%] flex justify-end mt-5'>
            <button className='w-[100px] h-[50px] rounded-xl shadow-xl bg-white/75 backdrop-blur-xl flex justify-center items-center font-bold'>
              <FontAwesomeIcon className='text-yellow-400 mr-2' icon={faStar} />
              즐겨찾기
            </button>
          </div>

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