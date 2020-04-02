import React from 'react'
import { AppConfig } from './interfaces/AppConfig'

export const initialState = {
    activeExhibition: null,
    playQueue: [],
    auditionDuration: process.env.DEFAULT_AUDITION_DURATION,
}

export const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'configLoad': {
            const config = action.payload as AppConfig
            let s = { ...state }
            if (config.auditionDuration) s.auditionDuration = config.auditionDuration
            if (window) {
                window.dispatchEvent(
                    new CustomEvent('configLoad', {
                        detail: config,
                    })
                )
            }
            return s
        }
        case 'exhibitionSet': {
            return { ...state, activeExhibition: action.payload }
        }
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
            if (action.payload.auditionDuration) {
                let d = parseInt(action.payload.auditionDuration)
                s.auditionDuration = d
                localStorage.setItem('auditionDuration', d.toString())
            }

            return s
        }
        default:
            return { ...state }
    }
}

//@ts-ignore
export const AppContext = React.createContext()
