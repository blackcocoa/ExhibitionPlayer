import React from 'react'

export const initialState = { playQueue: [] }

export const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'mediaSet': {
            return { ...state, playQueue: [action.payload] }
        }
        case 'mediaPush': {
            const queue = [...state.playQueue]
            queue.push(action.payload)
            return { ...state, playQueue: queue }
        }
        case 'queueClear': {
            return { ...state, playQueue: [] }
        }
        case 'queueNext': {
            const queue = [...state.playQueue]
            if (queue.length) queue.shift()
            return { ...state, playQueue: queue }
        }
        default:
            return { ...state }
    }
}

//@ts-ignore
export const AppContext = React.createContext()
