import React from 'react';
import {createPortal} from 'react-dom';

const modalRoot = document.body;

export default class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        modalRoot.appendChild(this.el);
        document.body.classList.add('modal-open');
    }

    componentWillUnmount() {
        modalRoot.removeChild(this.el);
        document.body.classList.remove('modal-open');
    }

    render() {
        return createPortal(this.props.children, this.el);
    }
}
