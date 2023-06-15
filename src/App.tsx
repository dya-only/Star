import KakaoMap from './components/Map/KakaoMap'
import { useGeolocated } from 'react-geolocated'

function App() {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
  })

  return (
      !isGeolocationAvailable ? <div className='w-screen h-screen flex justify-center items-center bg-gray-800 text-white font-bold text-2xl'>사용자의 위치 정보를 가져올 수 없어요.</div> :
      ! isGeolocationEnabled ? <div className='w-screen h-screen flex justify-center items-center bg-gray-800 text-white font-bold text-2xl'>사용자의 위치 정보를 가져올 수 없어요.</div> :
      coords ?
        <KakaoMap coords={coords} />
      : <div className='w-screen h-screen flex justify-center items-center bg-gray-800 text-white font-bold text-2xl'>사용자의 위치 정보를 가져올 수 없어요.</div>
  )
}

export default App