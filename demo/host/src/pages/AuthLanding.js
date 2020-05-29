import React from 'react';
import {parse} from 'querystring';
import {Redirect} from 'react-router-dom';
import {useAuthGate} from '../lib/useAuthGate';
import {stateToLocation} from '../lib';

const AuthLanding = ({match, location}) => {
    const {authorizing, authorized, error} = useAuthGate();

    if (authorizing) {
        return <div>Processing Landing Credentials...</div>;
    }

    if (authorized && !error) {
        const {state} = parse(location.search);
        return <Redirect to={state ? stateToLocation(state) : '/'} />;
    }

    //TODO Pick up error from location

    return <div>{error.toString()}</div>;
};

export default AuthLanding;
