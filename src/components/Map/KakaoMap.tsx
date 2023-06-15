import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'
import { getCafe } from '../getCafe/getCafe'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonWalking, faLocationDot, faMugSaucer, faArrowsLeftRight, faCar, faStar, faCrosshairs } from '@fortawesome/free-solid-svg-icons'
const API_KEY = 'AIzaSyD5jd1PhKwr78AVXuvNkIufDcdMa3HfPCg'

import ME from '../../assets/ME!!.png'
import CAFE from '../../assets/marker.png'
import EmptyStar from '../../assets/star-regular.svg'

const KakaoMap = (props: any) => {
  const [map, setMap] = useState(null as any)
  const [selected, setSelected] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState({} as any)
  const [kakaoInfo, setKakaoInfo] = useState({} as any)
  const [selectedDist, setSelectedDist] = useState({ distance: 0, walking: 0, car: 0 })

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
    const data = (await axios.get(`/maps/api/place/textsearch/json?query=${el.place_name}&key=${API_KEY}`)).data
    
    console.log(data)

    setSelectedDist({
      distance: Number((getDistance(Number(props.coords.latitude), Number(props.coords.longitude), Number(el.y), Number(el.x)) * 1000).toFixed(0)),
      walking: Number((Number((getDistance(Number(props.coords.latitude), Number(props.coords.longitude), Number(el.y), Number(el.x)) * 1000).toFixed(0)) / 1.3333 / 60).toFixed(0)),
      car: Number((Number((getDistance(Number(props.coords.latitude), Number(props.coords.longitude), Number(el.y), Number(el.x)) * 1000).toFixed(0)) / 6.3 / 60).toFixed(0))
    })    
    setSelectedMarker(data.results[0])
    setSelected(true)
  }

  const getCafeData = async () => {
    const cafe = await getCafe(props.coords)
    console.log(cafe)

    const container = document.getElementById('map') as HTMLElement
    const options = { center: new kakao.maps.LatLng(props.coords.latitude, props.coords.longitude), level: 4 }
    const kakaoMap = new kakao.maps.Map(container, options)
    setMap(kakaoMap)
    console.log(map)
    

    // Current my location
    new kakao.maps.Marker({
      map: kakaoMap,
      position: new kakao.maps.LatLng(props.coords.latitude, props.coords.longitude),
      image: new kakao.maps.MarkerImage(ME, new kakao.maps.Size(43, 45)),
    })

    await cafe.forEach((el: { y: number; x: number; place_name: string }) => {
      const marker = new kakao.maps.Marker({
        map: kakaoMap,
        position: new kakao.maps.LatLng(el.y, el.x),
        image: new kakao.maps.MarkerImage(CAFE, new kakao.maps.Size(32, 45)),
        title: el.place_name
      })

      const cutsomOverlay =
      `<div class='custom'>
        <div>${el.place_name}</div>
      </div>`
      new kakao.maps.CustomOverlay({
        map: kakaoMap,
        position: new kakao.maps.LatLng(el.y, el.x),
        content: cutsomOverlay,
        yAnchor: 1.9
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        setKakaoInfo(el)
        getMarkerInfo(el)
      })

      kakao.maps.event.addListener(kakaoMap, 'click', () => {
        setSelected(false)
        setSelectedMarker({})
      })
    })
  }

  useEffect(() => {
    getCafeData()
  },[])

    return (
      <Fragment>
        { selected ? 
          <div className='fixed z-30 w-screen h-screen bg-black/25 lg:hidden md:hidden' onClick={() => { setSelected(false); setSelectedMarker({})} } />
        : null }
        { selected ?
          <div className={`${ selected ? 'animated' : '' } overflow-y-auto fixed z-50 flex justify-center items-start shadow-2xl bg-white md:w-[400px] lg:w-[400px] w-screen lg:h-screen md:h-screen h-[80%] mt-[45%] lg:mt-0 md:mt-0`}>
            <div className='flex flex-col justify-start items-center'>

              { selectedMarker.photos ?
                <img className='w-screen h-[250px] object-cover' src={`/maps/api/place/photo?maxwidth=400&photo_reference=${selectedMarker.photos[0].photo_reference}&key=${API_KEY}`} alt='' />
              : <div className='lg:mt-12 md:mt-12 lg:-ml-[10px] md:-ml-[30px] lg:w-[490px] md:w-[380px] w-screen h-[250px] drop-shadow-xl lg:rounded-l-[0px] md:rounded-l-[0px] rounded-[50px] flex justify-center items-center font-bold text-2xl sm:ml-2'>이미지가 제공되지 않아요!</div> }
              
              { selectedMarker.opening_hours ?
                <div className='flex justify-center items-center mt-4'>
                  <div className='text-3xl font-bold mr-4 w-[220px]'>{ kakaoInfo.place_name }</div>
                  { selectedMarker.opening_hours.open_now ?
                    <div className="p-2 rounded-xl bg-white text-green-400 flex justift-center items-center">
                      <div className='rounded-full w-4 h-4 mr-2 bg-green-400'/> 영업중
                    </div>
                  : <div className="p-2 rounded-xl bg-white text-grey-400 flex justift-center items-center">
                      <div className='rounded-full w-4 h-4 mr-2 bg-gray-300'/> 문닫음
                    </div> }
                </div>
              : <div className="p-2 rounded-xl bg-white text-grey-400 flex justift-center items-center">
                  <div className='rounded-full w-4 h-4 mr-2 bg-red-300'/> 제공 안됨
                </div> }
              
              <div className='text-lg w-[315px] text-slate-400 mb-8'>{ selectedMarker.vicinity }</div>
              
              <div className='w-[310px] h-[80px] rounded-2xl bg-white border-[0.2px] border-gray-300 flex justify-start items-center mb-4'>
                <div className='rounded-[30px] w-[170px] h-[80px] flex justify-center items-center mr-8'>
                  <FontAwesomeIcon className='w-8 h-8 mr-4' icon={faLocationDot} />
                  <FontAwesomeIcon className='w-6 h-6 mr-4' icon={faArrowsLeftRight} />
                  <FontAwesomeIcon className='w-8 h-8' icon={faMugSaucer} />
                </div>
                <div className='text-2xl font-bold'>{ selectedDist.distance }m</div>
              </div>

              <div className='w-[310px] h-[80px] rounded-2xl bg-white border-[0.2px] border-gray-300 flex justify-start items-center mb-4'>
                <div className='rounded-[30px] w-[80px] h-[80px] flex justify-center items-center mr-8'>
                  <FontAwesomeIcon className='w-10 h-10' icon={faPersonWalking} />
                </div>
                <div className='text-2xl font-bold'>{ selectedDist.walking }분</div>
              </div>

              <div className='w-[310px] h-[80px] rounded-2xl bg-white border-[0.2px] border-gray-300 flex justify-start items-center mb-12'>
                <div className='rounded-[30px] w-[80px] h-[80px] flex justify-center items-center mr-8'>
                  <FontAwesomeIcon className='w-10 h-10' icon={faCar} />
                </div>
                <div className='text-2xl font-bold'>{ selectedDist.car }분</div>
              </div>

              <button className='w-[150px] h-[50px] flex justify-center items-center font-bold p-2 bg-white border-[0.2px] border-gray-300 rounded-xl lg:mb-0 md:mb-0 mb-12'>
                <img className='star w-6 h-6 mr-2' src={EmptyStar} alt="" />
                즐겨찾기 추가
              </button>
            </div>
          </div>
        : null }

        <div className='fixed z-30 lg:w-[98.5%] w-[95%] flex justify-end mt-5'>
          <button className='mr-4 w-[100px] h-[50px] rounded-xl shadow-xl bg-white flex justify-center items-center font-bold'>
            <FontAwesomeIcon className='text-yellow-400 mr-2' icon={faStar} />
            즐겨찾기
          </button>
          <button className='w-[50px] h-[50px] rounded-xl shadow-xl bg-white flex justify-center items-center font-bold' onClick={() => { setSelected(false); setSelectedMarker({}) }}>
            <FontAwesomeIcon className='text-gray-600 text-2xl' icon={faCrosshairs} />
          </button>
        </div>

        <div id="map" className='w-screen h-screen'></div>
      </Fragment>
    )
}

export default KakaoMap