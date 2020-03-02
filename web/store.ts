import React from 'react'

export const initialState = { id: null, type: null }

export const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'setMedia':
            return { ...state, id: action.value.id, type: action.value.type }
        default:
            return state
    }
}

//@ts-ignore
export const Context = React.createContext()
