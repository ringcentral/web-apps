import React, {FC, useEffect, useMemo, useCallback, useReducer, ReactElement, forwardRef, memo} from 'react';
import {createApp, App} from '@ringcentral/web-apps-host';
import {CustomElementComponent, IFrameComponent, DivComponent, FederatedComponent} from './Components';

export interface ApplicationOptions {
    id: string;
    type: string;
    url: string | string[];
}

const getComponent = (type: string): any => {
    switch (type) {
        case 'script':
            return CustomElementComponent;
        case 'iframe':
            return IFrameComponent;
        case 'global':
            return DivComponent;
        case 'federated':
            return FederatedComponent;
        default:
            return null;
    }
};

interface State extends ApplicationOptions {
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

export const useApplication = ({id, url, type}: ApplicationOptions): ApplicationReturn => {
    const [{error, app, node, type: storedType}, dispatch] = useReducer(reducer, initialState); // type is in store to make sure it's always in sync with app

    // Create App instance

    useEffect(() => {
        let mounted = true;

        console.warn('HOST: App ID has changed', id);
        dispatch({type: 'loading', payload: {id, url, type}});

        (async () => {
            if (!id || !url || !type) return; // maybe console.warn?
            try {
                if (mounted) dispatch({type: 'app', payload: await createApp({id, url, type})});
            } catch (error) {
                console.error('HOST: Cannot load app', id, error);
                if (mounted) dispatch({type: 'error', payload: error});
            }
        })();

        return () => (mounted = false);
    }, [id, type, url]);

    // Ref

    const nodeRef = useCallback(newNode => dispatch({type: 'node', payload: newNode}), []); // maybe call onReady here

    const Component = useMemo(
        () => props => <DynamicComponent {...props} type={storedType} app={app} ref={nodeRef} />, // type from store to make sure it's always in sync with app
        [app, nodeRef, storedType],
    );

    const loading = !node || error; // final loading status becomes true only when node is referenced & event listeners are set

    return {Component, error, loading, node};
};

export type ApplicationProps = ApplicationOptions & ApplicationReturn;

export const Application: FC<ApplicationOptions & {children: (ApplicationProps) => ReactElement}> = ({
    id,
    url,
    type,
    children,
    ...props
}) => {
    const appProps = useApplication({id, url, type});
    return children({
        ...props,
        ...appProps,
        type,
        id,
        url,
    });
};

export const withApplication = (
    {id: defaultId, url: defaultUrl, type: defaultType}: ApplicationOptions = {
        id: undefined,
        url: undefined,
        type: undefined,
    },
) => Cmp => {
    const WrappedComponent: FC<ApplicationOptions> = ({
        id = defaultId,
        url = defaultUrl,
        type = defaultType,
        children,
        ...props
    }) => {
        const appProps = useApplication({id, url, type});
        return <Cmp {...{...props, ...appProps, id, url, type}}>{children}</Cmp>;
    };
    WrappedComponent.displayName = `withApplication(${Cmp.displayName || Cmp.name || 'Cmp'})`;
    return WrappedComponent;
};
