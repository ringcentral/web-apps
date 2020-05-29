import React, {useEffect} from 'react';
import {withRouter} from 'react-router';
import {History} from 'history';
import {eventType} from '@ringcentral/web-apps-common';

export * from '@ringcentral/web-apps-common';

export const makeHistoryFromRouter = (router: any): History =>
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    ({
        listen: (...args) => router.listen(...args),
        replace: (...args) => router.replace(...args),
        push: (...args) => router.push(...args),
        get location() {
            return router.getCurrentLocation();
        },
    } as History);

export const normalizeHistory = ({history, router}: any): History => (router ? makeHistoryFromRouter(router) : history);

//@see https://github.com/ReactTraining/react-router/issues/7113
export const LocationSync = withRouter(({history, router}: any) => {
    useEffect(() => {
        const normalHistory = normalizeHistory({history, router}); //FIXME [UIA-10000] useHistory
        let timeout;

        const check = () => {
            if (window.location.pathname === normalHistory.location.pathname) return; // quick check

            const windowHref = normalHistory.createHref(window.location);
            const historyHref = normalHistory.createHref(normalHistory.location);

            if (windowHref === historyHref) return; // more complex check

            console.log('Synchronized URLs', windowHref, '->', historyHref);

            normalHistory.replace(windowHref);
        };

        const tick = () => {
            check();
            timeout = setTimeout(tick, 100);
        };

        tick();

        return () => clearTimeout(timeout);
    }, [history, router]);

    return <></>;
});

export const useListenerEffect = (node, event: eventType, listener) => {
    useEffect(() => {
        if (!node || !listener) return;
        node.addEventListener(event, listener);
        return () => node && node.removeEventListener(event, listener);
    }, [node, listener, event]);
};
