import React from 'react';
import {generateHTML} from './html-generator';

export default class HtmlPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: ''
        };
        this.handleUpdate = this.handleUpdate.bind(this);
        this.debouncedUpdate = this.debouncedUpdate.bind(this);
        this.debounceTimeout = null;
    }

    componentDidMount() {
        if (this.props.vm) {
            this.props.vm.on('PROJECT_CHANGED', this.debouncedUpdate);
            this.props.vm.on('targetsUpdate', this.debouncedUpdate);
            this.handleUpdate();
        }
    }

    componentWillUnmount() {
        if (this.props.vm) {
            this.props.vm.removeListener('PROJECT_CHANGED', this.debouncedUpdate);
            this.props.vm.removeListener('targetsUpdate', this.debouncedUpdate);
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
    }

    debouncedUpdate() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(() => {
            this.handleUpdate();
        }, 300);
    }

    handleUpdate() {
        if (this.props.vm) {
            const html = generateHTML(this.props.vm);
            this.setState({ html });
        }
    }

    render() {
        return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                <iframe
                    srcDoc={this.state.html || '<p>Henüz HTML üretilmedi.</p>'}
                    sandbox=""
                    style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                    title="HTML Preview"
                />
            </div>
        );
    }
}
