import React, {IframeHTMLAttributes, useEffect, useRef, RefObject} from 'react';
import {withRouter, RouteComponentProps} from 'react-router';
import {HostSync, HostSyncInit} from '@ringcentral/web-apps-sync-host';
import {normalizeHistory} from '@ringcentral/web-apps-react';

/**
 * @see https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
 */
export function useCombinedRefs<T>(...refs): RefObject<T> {
    const targetRef = React.useRef<T>();

    useEffect(() => {
        refs.forEach(ref => {
            if (!ref) return;

            if (typeof ref === 'function') {
                ref(targetRef.current);
            } else {
                ref.current = targetRef.current;
            }
        });
    }, [refs]);

    return targetRef;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IFrameProps
    extends IframeHTMLAttributes<HTMLIFrameElement>,
        RouteComponentProps,
        Pick<HostSyncInit, 'tracking' | 'minHeight' | 'origin'> {
    nodeRef: any;
    url: string;
}

/**
 * @see https://github.com/ReactTraining/react-router/issues/6056 cannot use ref here...
 */
export const IFrame = withRouter<IFrameProps, any>(({nodeRef, id, url, tracking, minHeight, origin, ...props}) => {
    const history = normalizeHistory(props); //FIXME [UIA-10000] useHistory
    const iframe = useRef<HTMLIFrameElement>(null);
    const combinedRef = useCombinedRefs<HTMLIFrameElement>(nodeRef, iframe);

    useEffect(() => {
        const sync = new HostSync({
            id,
            url,
            iframe: combinedRef.current,
            history,
            tracking,
            minHeight,
            origin,
        });

        return () => sync.destroy();
    }, [combinedRef, history, id, iframe, minHeight, origin, tracking, url]);

    delete props['staticContext']; // some router crap

    return (
        <iframe
            ref={combinedRef}
            src="" // will be set by HostSync
            title="synchronized-iframe"
            scrolling="no"
            frameBorder="no"
            {...props}
        />
    );
});
