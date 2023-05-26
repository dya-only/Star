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
      !isGeolocationAvailable ? '사용자의 위치 정보를 가져올 수 없어요.' :
      ! isGeolocationEnabled ? '사용자의 위치 정보를 가져올 수 없어요.' :
      coords ?
        <KakaoMap coords={coords} />
      : '사용자의 위치 정보를 가져올 수 없어요.'
  )
}

export default App