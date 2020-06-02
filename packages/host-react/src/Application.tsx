import React, {FC, useEffect, useMemo, useCallback, useReducer, ReactElement, forwardRef, memo} from 'react';
import {createApp, App, CreateAppInit} from '@ringcentral/web-apps-host';
import {CustomElementComponent, IFrameComponent, DivComponent} from './Components';

const getComponent = (type: string): any => {
    switch (type) {
        case 'script':
            return CustomElementComponent;
        case 'iframe':
            return IFrameComponent;
        case 'global':
            return DivComponent;
        default:
            return null;
    }
};

interface State extends CreateAppInit {
    app?: App;
    error?: Error;
    node?: HTMLElement;
}

const initialState: State = {error: null, app: null, node: null, id: null, type: null, url: null};

const reducer = (state: State, {type, payload}) => {
    switch (type) {
        case 'loading':
            return {...state, ...initialState, ...payload};
        case 'error':
            return {...state, error: payload};
        case 'app':
            return {...state, app: payload};
        case 'node':
            return {...state, node: payload};
        default:
            return state;
    }
};

const DynamicComponent = memo(
    forwardRef<any, {type: string; app: App}>(function DynamicComponent({type, app, ...props}, ref) {
        const Component = app && getComponent(type); // no app means loading
        return Component ? <Component {...props} app={app} ref={ref} /> : null;
    }),
);

export interface ApplicationReturn {
    Component?: FC;
    error?: Error;
    loading?: boolean;
    node?: HTMLElement;
}

export const useApplication = ({id, url, type, options}: CreateAppInit): ApplicationReturn => {
    const [{error, app, node, type: storedType}, dispatch] = useReducer(reducer, initialState); // type is in store to make sure it's always in sync with app

    // Create App instance

    useEffect(() => {
        let mounted = true;

        console.warn('HOST: App ID has changed', id);
        dispatch({type: 'loading', payload: {id, url, type}});

        (async () => {
            if (!id || !url || !type) return; // maybe console.warn?
            try {
                if (mounted) dispatch({type: 'app', payload: await createApp({id, url, type, options})});
            } catch (error) {
                console.error('HOST: Cannot load app', id, error);
                if (mounted) dispatch({type: 'error', payload: error});
            }
        })();

        return () => (mounted = false);
    }, [id, options, type, url]);

    // Ref

    const nodeRef = useCallback(newNode => dispatch({type: 'node', payload: newNode}), []); // maybe call onReady here

    const Component = useMemo(
        () => props => <DynamicComponent {...props} type={storedType} app={app} ref={nodeRef} />, // type from store to make sure it's always in sync with app
        [app, nodeRef, storedType],
    );

    const loading = !node || error; // final loading status becomes true only when node is referenced & event listeners are set

    return {Component, error, loading, node};
};

export type ApplicationProps = CreateAppInit & ApplicationReturn;

export const Application: FC<CreateAppInit & {children: (ApplicationProps) => ReactElement}> = ({children, ...props}) =>
    children({...props, ...useApplication(props)});

export const withApplication = (defaults: CreateAppInit) => Cmp => {
    const WrappedComponent: FC<CreateAppInit> = ({children, ...props}) => {
        const defaultedProps = {...defaults, ...props};
        const appProps = useApplication(defaultedProps);
        return <Cmp {...{...defaultedProps, ...appProps}}>{children}</Cmp>;
    };
    WrappedComponent.displayName = `withApplication(${Cmp.displayName || Cmp.name || 'Cmp'})`;
    return WrappedComponent;
};
