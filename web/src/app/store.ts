import React from 'react'
import { Media } from '../../../shared/Media'
import { Circle } from '../../../shared/Circle'
import { AppConfig } from './interfaces/AppConfig'
import { Exhibition } from '../../../shared/Exhibition'

if (!process.env.DEFAULT_AUDITION_DURATION) {
    throw new Error('env not set properly')
}

export interface State {
    activeExhibition: Exhibition | null
    playQueue: Media[]
    auditionDuration: number,
    favCircles: Circle[],
    isFavViewOpen: boolean,
    isLoading: boolean
}

export const initialState: State = {
    activeExhibition: null,
    playQueue: [],
    auditionDuration: parseInt(process.env.DEFAULT_AUDITION_DURATION),
    favCircles: [],
    isFavViewOpen: false,
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
            let s:State = { ...state }
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
        case 'mediaPlayNow': {
            let s:State = { ...state }
            if (!action.payload) return s

            s.playQueue = s.playQueue.filter(m => m.circleId !== action.payload.circleId)
            s.playQueue.shift()
            s.playQueue.unshift(action.payload)
          
            return s
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
            let s:State = { ...state }
            if (action.payload.auditionDuration) {
                let d = parseInt(action.payload.auditionDuration)
                s.auditionDuration = d
                localStorage.setItem('auditionDuration', d.toString())
            }

            return s
        }
        case 'favOpen': {
            return {...state, isFavViewOpen: true}
        }
        case 'favClose': {
            return {...state, isFavViewOpen: false}
        }
        case 'favLoad': {
            return  { ...state, favCircles: action.payload }
        }
        case 'favAdd': {
            let s:State = { ...state }
            if (!action.payload || !action.payload.id) return s

            if (s.favCircles.map(c => c.id).indexOf(action.payload.id) < 0) s.favCircles.push(action.payload)

            if (s.activeExhibition) {
                const newId = `${s.activeExhibition!.id}:${action.payload.id}`
                let old = localStorage.getItem('favCircles')
                if (old) {
                    if (old.split(',').indexOf(newId) < 0) localStorage.setItem('favCircles', `${old},${newId}`)
                } else localStorage.setItem('favCircles', newId)
            }
            return s
        }
        case 'favRemove': {
            let s:State = { ...state }
            if (!action.payload || !action.payload.id) return s

            s.favCircles = s.favCircles.filter(c => c.id !== action.payload.id)

            let old = localStorage.getItem('favCircles')
            if (old && s.activeExhibition) {
                let favs = old.split(',')
                const newId = `${s.activeExhibition!.id}:${action.payload.id}`
                localStorage.setItem('favCircles', favs.filter(f => f !== newId).join(','))
            }
            return s
        }
        default:
            return { ...state }
    }
}
