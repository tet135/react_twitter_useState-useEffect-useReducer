import React from 'react'

import { useState, useEffect, useReducer } from 'react'

import Page from './component/page'
import Grid from './component/grid'
import Box from './component/box'
import PostList from './container/post-list'

//+++++++++++
//Хук редукції

//NB! LIST_ACTION_TYPE, function listReduser and initState можна винести в окремий файл

const LIST_ACTION_TYPE = {
  ADD: 'add',
  DELETE: 'delete',
  SELECT: 'select',
  REVERSE: 'reverse',
}

//listReducer and initState можна винести в окримий файл(в папко init) і перевикористовувати
function listReducer(state, action) {
  //наявність якоїсь валідації тут, в редюсері, дає зайві ререндери!!! Тому валідація зазвичай розміщується в handle-функуції
  // if (action.trim() === '') return { ...state }

  // console.log(state, action)

  //функція reducer має повернути новий об'єкт state!!!!!!! тому обов'язково повертати щось!

  // if (!state.payload) {
  //   throw new Error('need state.payload')
  // }

  //в рамках reducer прийнято використовувати switch-case
  switch (action.type) {
    case LIST_ACTION_TYPE.ADD:
      const id = new Date().getTime()
      const newItem = { value: action.payload, id }

      return {
        ...state,
        items: [...state.items, newItem],
      }

    case LIST_ACTION_TYPE.DELETE:
      const newItems = state.items.filter(
        (item) => item.id !== action.payload,
      )
      return { ...state, items: newItems }

    case LIST_ACTION_TYPE.SELECT:
      return {
        ...state,
        selectedId:
          action.payload === state.selectedId
            ? null
            : action.payload,
      }

    case LIST_ACTION_TYPE.REVERSE:
      return {
        ...state,
        items: state.items.reverse(),
      }

    default:
      return { ...state }
  }
}

const initState = {
  items: [],
}

function App() {
  console.log('render')
  const [location, setLocation] = useState(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })
        },
        (error) => {
          console.error(
            'Помилка отримання геолокації',
            error.message,
          )
        },
      )
    } else {
      console.error(
        'Геолокація не цьому пристрої не підтримується',
      )
    }
  }, [])
  // useEffect(() => {
  //   function handleMove(event) {
  //     setCoordinates({ x: event.clientX, y: event.clientY })
  //   }

  //   window.addEventListener('pointermove', handleMove)

  //   return () => {
  //     window.removeEventListener('pointermove', handleMove)
  //   }
  // }, [])

  //+++++++++++
  //Хук редукції

  const init = (state) => {
    if (state.items && state.items.length === 0) {
      return {
        ...state,
        items: [{ id: 34423, value: 'first item' }],
      }
    } else {
      return state
    }
  }

  const [state, dispatch] = useReducer(
    listReducer,
    initState,
    init,
  )

  const handleAddItem = (event) => {
    // console.log(event.target.value)
    const { value } = event.target
    // саме тут, в handle-функції, варто писати валідацію!
    if (value.trim() === '') return null
    //бо після цього if функція завершується і не доходить до dispatch,тому немає зайвих ререндерів

    dispatch({ type: LIST_ACTION_TYPE.ADD, payload: value })

    event.target.value = ''
  }

  const handleRemoveItem = (id) =>
    dispatch({ type: LIST_ACTION_TYPE.DELETE, payload: id })

  const handleSelectItem = (id) => {
    dispatch({ type: LIST_ACTION_TYPE.SELECT, payload: id })
  }

  const handleReverseItem = () => {
    dispatch({ type: LIST_ACTION_TYPE.REVERSE })
  }

  return (
    <Page>
      {location ? (
        <div>
          <h1>Ваші координати:</h1>
          <p>широта: {location.latitude}</p>
          <p>довгота: {location.longitude}</p>
        </div>
      ) : (
        <p>Отримання геолокації...</p>
      )}

      {/* {/* //+++++++++++
      //Хук редукції */}
      <Grid>
        <Box>
          <Grid>
            <h1>Список елементів:</h1>
            <ul>
              <Grid>
                {/* при ініціалізацію буде state.items = [] */}
                {state.items.map(({ value, id }) => (
                  <li
                    onClick={() => handleSelectItem(id)}
                    key={id}
                  >
                    <Box
                      style={{
                        borderColor:
                          state.selectedId === id
                            ? 'blue'
                            : '#e6e6e6',
                      }}
                    >
                      <Grid>
                        <span>{value}</span>
                        <Box>
                          <button
                            onClick={(e) => {
                              //прибираємо спливання події: щоб видалення елементу не прибирало виділення елемента
                              e.stopPropagation()
                              handleRemoveItem(id)
                            }}
                            type="button"
                          >
                            Видалити
                          </button>
                        </Box>
                      </Grid>
                    </Box>
                  </li>
                ))}
              </Grid>
            </ul>
          </Grid>
        </Box>
        <Box>
          <input
            onBlur={handleAddItem}
            type="text"
            placeholder="Введіть елемент"
          ></input>
        </Box>
        <Box>
          <button onClick={handleReverseItem}>
            Змінити порядок
          </button>
        </Box>
      </Grid>
    </Page>
  )
}

export default App

// 38.50 - другий приклад
