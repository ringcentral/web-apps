import {useEffect, useReducer} from 'react';
import {appRegistry} from './registry';

const initialState = {id: null, url: null, type: null, error: null, loading: false};

const reducer = (state, {type, payload}) => {
    switch (type) {
        case 'loading':
            return {...state, ...initialState, loading: true};
        case 'error':
            return {...state, ...initialState, error: payload};
        case 'success':
            return {...state, ...initialState, ...payload};
        default:
            return state;
    }
};

export const useAppRegistry = appId => {
    const [state, dispatch] = useReducer(reducer, {...initialState, loading: true});

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                dispatch({type: 'loading'});

                if (!appRegistry[appId]) throw new Error(`App ${appId} not found in registry`);

                // registry itself can also be loaded from API for example
                const {getUrl, type, origin} = appRegistry[appId];

                // this allows to override url of app, useful for production to swap deployed version with local
                const {appsOverrides} = window.localStorage;

                const url = await getUrl(appsOverrides && appsOverrides[appId] && appsOverrides[appId].url);

                if (mounted) dispatch({type: 'success', payload: {id: appId, url, type, origin}}); // by setting ID to state we make sure that id, url and type are in sync
            } catch (error) {
                if (mounted) dispatch({type: 'error', payload: error});
            }
        })();
        return () => (mounted = false);
    }, [appId]);

    return state;
};
