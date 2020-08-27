import React from 'react'
import { Media } from '../../../shared/Media'
import { AppConfig } from './interfaces/AppConfig'
import { Exhibition } from '../../../shared/Exhibition'

if (!process.env.DEFAULT_AUDITION_DURATION) {
    throw new Error('env not set properly')
}

export interface State {
    activeExhibition: Exhibition | null
    playQueue: Media[]
    auditionDuration: number
    isLoading: boolean
}

export const initialState: State = {
    activeExhibition: null,
    playQueue: [],
    auditionDuration: parseInt(process.env.DEFAULT_AUDITION_DURATION),
    isLoading: false,
}

export interface IContextProps {
    state: State
    dispatch: React.Dispatch<any>
}

export const AppContext = React.createContext({} as IContextProps)

export const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'loading': {
            return { ...state, isLoading: true }
        }
        case 'loadingEnd': {
            return { ...state, isLoading: false }
        }
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
