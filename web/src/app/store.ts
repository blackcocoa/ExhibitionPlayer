import React from 'react'

export const initialState = { playQueue: [], auditionDuration: 5000 }

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
        case 'updateSetting': {
            let s = { ...state }
            if (action.payload.auditionDuration) s.auditionDuration = parseInt(action.payload.auditionDuration)
            return s
        }
        default:
            return { ...state }
    }
}

//@ts-ignore
export const AppContext = React.createContext()
