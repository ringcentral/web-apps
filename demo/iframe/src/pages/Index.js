import React from 'react';
import {sdk} from '../lib';

export default class Index extends React.Component {
    state = {data: null};

    async componentDidMount() {
        const data = await (await sdk.platform().get('/restapi/v1.0/client-info')).json();
        this.setState({data});
    }

    render() {
        const {data} = this.state;
        return data ? (
            <p>
                Response from API: <code>{JSON.stringify(data.client.appName, null, 2)}</code>
            </p>
        ) : (
            <p>Loading...</p>
        );
    }
}
