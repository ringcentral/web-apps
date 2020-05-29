import {useEffect, useReducer} from 'react';
import {sdk} from '.';

function reducer(state, action) {
    switch (action.type) {
        case 'authorizing':
            return {...state, authorizing: true};
        case 'error':
            return {...state, authorizing: false, authorized: false, error: action.payload};
        case 'success':
            return {...state, authorizing: false, authorized: true};
        default:
            throw new Error();
    }
}

export const useAuthGate = () => {
    const [state, dispatch] = useReducer(reducer, {error: null, authorizing: true, authorized: false});
    useEffect(() => {
        let mounted = true;
        const dispatchIfMounted = (...args) => mounted && dispatch(...args);
        (async () => {
            try {
                dispatchIfMounted({type: 'authorizing'});
                const res = await sdk.platform().loggedIn();
                if (res) {
                    dispatchIfMounted({type: 'success'});
                } else {
                    throw new Error(`Not authorized`);
                }
            } catch (error) {
                dispatchIfMounted({type: 'error', error: true, payload: error});
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);
    return {...state, logout: () => alert('Not implemented yet')};
};
