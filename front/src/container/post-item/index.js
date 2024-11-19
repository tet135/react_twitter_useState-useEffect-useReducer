import {
  Fragment,
  useState,
  useEffect,
  useReducer,
} from 'react'

import './index.css'

import Grid from '../../component/grid'
import Box from '../../component/box'
import PostContent from '../../component/post-content'

import PostCreate from '../post-create'
import {
  LOAD_STATUS,
  Skeleton,
  Alert,
} from '../../component/load'

import {
  REQUEST_ACTION_TYPE,
  requestInitialState,
  requestReducer,
} from '../../util/request'

import { getDate } from '../../util/getDate'

export default function Container({
  id,
  username,
  text,
  date,
}) {
  const [state, dispatch] = useReducer(
    requestReducer,
    requestInitialState,
    //функція init отримує дані з props
    (state) => ({
      ...state,
      data: {
        id,
        username,
        text,
        date,
        reply: null,
      },
    }),
  )

  //data - щоб тримати дані з сервера
  // const [data, setData] = useState()

  // const [status, setStatus] = useState(null)
  // const [message, setMessage] = useState('')

  const getData = async () => {
    dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS })
    try {
      //in GET requests we can ignore method: "GET" and configurative data
      const res = await fetch(
        `http://localhost:4000/post-item?id=${state.data.id}`,
      )

      const resData = await res.json()

      if (res.ok) {
        dispatch({
          type: REQUEST_ACTION_TYPE.SUCCESS,
          payload: convertData(resData),
        })
        // setData(convertData(resData))
        // setStatus(LOAD_STATUS.SUCCESS)
      } else {
        dispatch({
          type: REQUEST_ACTION_TYPE.ERROR,
          payload: resData.message,
        })
        // setMessage(resData.message)
        // setStatus(LOAD_STATUS.ERROR)
      }
    } catch (error) {
      dispatch({
        type: REQUEST_ACTION_TYPE.ERROR,
        payload: error.message,
      })
      // setMessage(error.message)
      // setStatus(LOAD_STATUS.ERROR)
    }
  }

  //raw (все, що приходить в data) деструктуризуэться як {post}
  const convertData = ({ post }) => ({
    id: post.id,
    username: post.username,
    text: post.text,
    date: getDate(post.date),

    reply: post.reply
      .reverse()
      .map(({ id, username, text, date }) => ({
        id,
        username,
        text,
        date: getDate(date),
      })),

    isEmpty: post.reply.length === 0,
  })

  const [isOpen, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(!isOpen)
  }

  useEffect(() => {
    // alert(isOpen)
    if (isOpen === true) {
      getData()
    }
  }, [isOpen])

  return (
    <Box style={{ padding: '0' }}>
      <div
        style={{
          padding: '20px',
          cursor: 'pointer',
        }}
        onClick={handleOpen}
      >
        <PostContent
          username={state.data.username}
          date={state.data.date}
          text={state.data.text}
        />
      </div>

      {isOpen && (
        <div style={{ padding: '0 20px 20px 20px' }}>
          <Grid>
            <Box>
              <PostCreate
                placeholder="Post your reply!"
                button="Reply"
                id={state.data.id}
                onCreate={getData}
              />
            </Box>

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
                message={state.message}
                status={state.status}
              />
            )}

            {state.status === LOAD_STATUS.SUCCESS &&
              state.data.isEmpty === false &&
              state.data.reply.map((item) => (
                <Fragment key={item.id}>
                  <Box>
                    <PostContent {...item} />
                  </Box>
                </Fragment>
              ))}
          </Grid>
        </div>
      )}
    </Box>
  )
}
