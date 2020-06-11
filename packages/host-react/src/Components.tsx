import React, {FC, forwardRef, useEffect, useRef} from 'react';
import {IFrame, IFrameProps, useCombinedRefs} from '@ringcentral/web-apps-sync-react';
import {App, ScriptApp, GlobalApp} from '@ringcentral/web-apps-host';

export interface Props {
    app: App;
}

export const CustomElementComponent: FC<Props> = forwardRef<any, Props>(function CustomElementComponent(
    {app, ...props},
    ref,
) {
    const {tag} = app as ScriptApp;
    const Tag = tag() as any;
    return <Tag {...props} ref={ref} />;
});

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IFrameComponentProps extends Props, IFrameProps {}

/**
 * @see https://github.com/ReactTraining/react-router/issues/6056 cannot use ref in IFrame...
 */
export const IFrameComponent: FC<IFrameComponentProps> = forwardRef<any, IFrameComponentProps>(function IFrameComponent(
    {app: {url, id}, ...props},
    ref,
) {
    return (
        <IFrame
            nodeRef={ref}
            style={{width: '1px', minWidth: '100%'}}
            title={id}
            id={id}
            url={Array.isArray(url) ? url[0] : (url as string)}
            {...props as any}
        />
    );
});

export interface DivComponentProps extends Props {
    direct: boolean;
}

export const DivComponent: FC<DivComponentProps> = forwardRef<any, DivComponentProps>(function DivComponent(
    {app, direct, ...props},
    ref,
) {
    const {id, callback} = app as GlobalApp;
    const node = useRef<HTMLDivElement>(null);
    const combinedRef = useCombinedRefs<HTMLDivElement>(ref, node);
    // this is used for Global apps in JSONP mode
    useEffect(() => (direct ? () => {} : callback(combinedRef.current)), [callback, combinedRef, direct, id]);
    // this is used for Global apps in direct mode
    const Cmp = direct && callback;
    return (
        <>
            <div ref={combinedRef} {...props} />
            {Cmp && <Cmp node={node} {...props} />}
        </>
    );
});
