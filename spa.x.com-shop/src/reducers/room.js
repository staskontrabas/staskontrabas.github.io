const initialState = {
  room: 'shop',
  news: []
}

//const initialState = ['shop']

export default function room(state = initialState, action) {

  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, room: action.payload }

    default:
      return state;
  }

}