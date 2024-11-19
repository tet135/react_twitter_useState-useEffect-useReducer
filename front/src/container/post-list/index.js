import {
  useState,
  useEffect,
  useReducer,
  Fragment,
} from 'react'

import Grid from '../../component/grid'
import Box from '../../component/box'
import Title from '../../component/title'

import PostItem from '../post-item'
import PostCreate from '../post-create'

import { useWindowListener } from '../../util/useWindowListener'

import {
  Alert,
  LOAD_STATUS,
  Skeleton,
} from '../../component/load'

import { getDate } from '../../util/getDate'
import {
  REQUEST_ACTION_TYPE,
  requestInitialState,
  requestReducer,
} from '../../util/request'

export default function Container() {
  const [state, dispatch] = useReducer(
    requestReducer,
    requestInitialState,
  )

  // const [status, setStatus] = useState(null)
  // const [message, setMessage] = useState('')
  // //data- щоб тримати дані з сервера
  // const [data, setData] = useState(null)

  const getData = async () => {
    dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS })

    // тут функціонал для отримання списка постів
    try {
      const res = await fetch(
        'http://localhost:4000/post-list',
        //method: "GET" можна не писати, бо за замовчуванням всякий метод GET
        {
          method: 'GET',
        },
      )

      const data = await res.json()

      if (res.ok) {
        dispatch({
          type: REQUEST_ACTION_TYPE.SUCCESS,
          payload: convertData(data),
        })
      } else {
        dispatch({
          type: REQUEST_ACTION_TYPE.ERROR,
          payload: data.message,
        })
      }
    } catch (error) {
      dispatch({
        type: REQUEST_ACTION_TYPE.ERROR,
        payload: error.message,
      })
    }
  }

  const convertData = (raw) => ({
    list: raw.list
      .reverse()
      .map(({ id, username, text, date }) => ({
        id,
        username,
        text,
        date: getDate(date),
      })),

    isEmpty: raw.list.length === 0,
  })

  //класичне використання useEffect для разового завантаження даних з сервера
  useEffect(() => {
    // alert('render useEffect')
    getData()
    const intervalId = setInterval(() => getData(), 5000)

    //setInterval -  JS code, so we need to clearInterval(intervalId) to stop repeating setInterval after unmounting of component
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const [coordinates, setCoordinates] = useState({
    x: 0,
    y: 0,
  })

  useWindowListener('pointermove', (event) => {
    setCoordinates({ x: event.clientX, y: event.clientY })
  })

  return (
    <Grid>
      {/* //це створення нового поста */}
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'pink',
          opacity: 0.6,
          width: 40,
          height: 40,
          borderRadius: '50%',
          top: -20,
          left: -20,
          pointerEvents: 'none',
          transform: `translate(${coordinates.x}px, ${coordinates.y}px)`,
        }}
      ></div>
      <Box>
        <Grid>
          <Title>Home</Title>
          <PostCreate
            //в пропс onCreate кладемо функцію getData, щоб при створенні нового поста
            // одразу оновлювалися дані і оновлювався перелік постів
            onCreate={getData}
            placeholder="What is happening?!"
            button="Post"
          />
        </Grid>
      </Box>

      {/* //тут будуть виводитись пости */}
      {state.status === LOAD_STATUS.PROGRESS && (
        <Fragment>
          <Box>
            <Skeleton />
          </Box>
          <Box>
            <Skeleton />
          </Box>
        </Fragment>
      )}

      {state.status === LOAD_STATUS.ERROR && (
        <Alert
          status={state.status}
          message={state.message}
        />
      )}

      {state.status === LOAD_STATUS.SUCCESS && (
        <Fragment>
          {state.data.isEmpty ? (
            <Alert message="Список постів порожній" />
          ) : (
            state.data.list.map((item) => (
              <Fragment key={item.id}>
                {/* //item = id, username, text, date */}
                <PostItem {...item} />
              </Fragment>
            ))
          )}
        </Fragment>
      )}
    </Grid>
  )
}
