import { withStyles, Slider } from '@material-ui/core'

export const BaseSlider = withStyles({
    root: {
        color: '#33aaff',
        height: 4,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -9,
        marginLeft: -12,
        '&:focus,&:hover,&$active': {
            boxShadow: 'inherit',
        },
    },
    valueLabel: {
        fontSize: 16,
    },
    track: {
        height: 6,
        borderRadius: 3,
    },
    rail: {
        height: 6,
        borderRadius: 3,
    },
})(Slider)
