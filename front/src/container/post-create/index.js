import './index.css'

import { useReducer } from 'react'

import Grid from '../../component/grid'
import FieldForm from '../../component/field-form'

import {
  Alert,
  Loader,
  LOAD_STATUS,
} from '../../component/load'

import {
  REQUEST_ACTION_TYPE,
  requestInitialState,
  requestReducer,
} from '../../util/request'

// props id поста (до якого дається відповідь) є необов'язковим і буде передаватися разом з даними з контейнера post-crate
export default function Container({
  onCreate,
  placeholder,
  button,
  id = null,
}) {
  // //для статусу
  // const [status, setStatus] = useState(null)
  // //для повідомлення про помилку
  // const [message, setMessage] = useState('')

  const [state, dispatch] = useReducer(
    requestReducer,
    requestInitialState,
  )

  const handleSubmit = (value) => {
    return sendData({ value })
  }
  //dataToSend - це value(дані, які надсилаємо)
  const sendData = async (dataToSend) => {
    dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS })

    try {
      const res = await fetch(
        `http://localhost:4000/post-create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: convertData(dataToSend),
        },
      )

      const data = await res.json()

      if (res.ok) {
        dispatch({ type: REQUEST_ACTION_TYPE.RESET })
        //or setStatus(null)
        // setStatus(LOAD_STATUS.SUCCESS)
        //props onCreate містить функцію getData, яка виводить список постів.
        //отже користувач побачить оновлену сторінку сайту зі своїм постом,
        // і так зрозуміє, що запит виконався успішно
        if (onCreate) onCreate()
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
      //важливо спочатку месседж, а потім статус
      // setMessage(error.message)
      // setStatus(LOAD_STATUS.ERROR)
    }
  }

  // dataToSend = value;
  const convertData = ({ value }) =>
    JSON.stringify({
      text: value,
      //тут "user", бо тут немає аутентифікації(ex., класу User)
      username: 'user',
      postId: id,
    })

  return (
    <Grid>
      {/* FieldForm відповідає за бізнес-логіку */}
      <FieldForm
        placeholder={placeholder}
        button={button}
        onSubmit={handleSubmit}
      />
      {state.status === LOAD_STATUS.ERROR && (
        <Alert
          status={state.status}
          message={state.message}
        />
      )}
      {state.status === LOAD_STATUS.PROGRESS && <Loader />}
    </Grid>
  )
}
