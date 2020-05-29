import React, {FC, forwardRef, useEffect, useRef} from 'react';
import {IFrame, useCombinedRefs} from '@ringcentral/web-apps-sync-react';
import {getAppCallback} from '@ringcentral/web-apps-common';
import {App, ScriptApp} from '@ringcentral/web-apps-host';

export interface Props {
    app: App;
}

export const CustomElementComponent: FC<Props> = forwardRef(function CustomElementComponent({app, ...props}, ref) {
    const {tag} = app as ScriptApp;
    const Tag = tag() as any;
    return <Tag {...props} ref={ref} />;
});

/**
 * @see https://github.com/ReactTraining/react-router/issues/6056 cannot use ref in IFrame...
 */
export const IFrameComponent: FC<Props> = forwardRef(function IFrameComponent({app: {url, id}, ...props}, ref) {
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

export const DivComponent: FC<Props> = forwardRef<any, Props>(function DivComponent({app: {id}, ...props}, ref) {
    const div = useRef<HTMLDivElement>(null);
    const combinedRef = useCombinedRefs<HTMLDivElement>(ref, div);

    useEffect(() => {
        return getAppCallback(id)(combinedRef.current);
    }, [combinedRef, id]);

    return <div ref={combinedRef} {...props} />;
});
