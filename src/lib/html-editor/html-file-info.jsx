import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

import Box from '../../components/box/box.jsx';
import Label from '../../components/forms/label.jsx';
import Input from '../../components/forms/input.jsx';
import BufferedInputHOC from '../../components/forms/buffered-input-hoc.jsx';
import htmlEditorState from './html-editor-state';

import styles from '../../components/sprite-info/sprite-info.css'; // Reuse sprite-info styles
import htmlStyles from './html-file-info.css'; // Specific overrides

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    spriteNamePlaceholder: {
        id: 'gui.SpriteInfo.spriteNamePlaceholder',
        defaultMessage: 'Name',
        description: 'Placeholder text for sprite name'
    }
});

class HtmlFileInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activePageId: null,
            width: 1280,
            height: 720,
            zoom: 100,
            fit: true
        };
        this.handleChangeWidth = this.handleChangeWidth.bind(this);
        this.handleChangeHeight = this.handleChangeHeight.bind(this);
        this.handleChangeZoom = this.handleChangeZoom.bind(this);
        this.handlePresetMobile = this.handlePresetMobile.bind(this);
        this.handlePresetTablet = this.handlePresetTablet.bind(this);
        this.handlePresetDesktop = this.handlePresetDesktop.bind(this);
        this.handlePresetFit = this.handlePresetFit.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = htmlEditorState.subscribe((newState) => {
            this.setState(newState);
        });
        this.setState(htmlEditorState.getState());
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handleChangeWidth(e) {
        const width = Math.max(10, parseInt(e.target.value, 10) || 1280);
        htmlEditorState.setState({ width });
    }

    handleChangeHeight(e) {
        const height = Math.max(10, parseInt(e.target.value, 10) || 720);
        htmlEditorState.setState({ height });
    }

    handleChangeZoom(e) {
        const zoom = Math.max(10, parseInt(e.target.value, 10) || 100);
        htmlEditorState.setState({ zoom, fit: false });
    }

    handlePresetMobile() {
        htmlEditorState.setState({ width: 375, height: 667 });
    }

    handlePresetTablet() {
        htmlEditorState.setState({ width: 768, height: 1024 });
    }

    handlePresetDesktop() {
        htmlEditorState.setState({ width: 1280, height: 720 });
    }

    handlePresetFit() {
        htmlEditorState.setState({ fit: true, zoom: 100 }); // zoom is ignored when fit is true, but we reset it
    }

    render() {
        const {
            disabled,
            name,
            onChangeName,
            intl
        } = this.props;

        return (
            <Box className={classNames(styles.spriteInfo, htmlStyles.htmlFileInfo)}>
                <div className={classNames(styles.rowPrimary, htmlStyles.htmlFileRowPrimary)}>
                    <div className={styles.group}>
                        <Label text="Dosya Adı">
                            <BufferedInput
                                className={classNames(styles.spriteInput, htmlStyles.htmlFileInput)}
                                disabled={disabled}
                                placeholder={intl.formatMessage(messages.spriteNamePlaceholder)}
                                tabIndex="0"
                                type="text"
                                value={disabled ? '' : name}
                                onSubmit={onChangeName}
                            />
                        </Label>
                    </div>
                </div>
                
                <div className={classNames(styles.rowSecondary, htmlStyles.htmlFileRowSecondary)}>
                    <div className={styles.group}>
                        <Label text="Genişlik">
                            <BufferedInput
                                className={classNames(styles.spriteInput, htmlStyles.htmlFileNumberInput)}
                                disabled={disabled}
                                type="text"
                                value={disabled ? '' : this.state.width}
                                onSubmit={this.handleChangeWidth}
                            />
                        </Label>
                    </div>
                    <div className={styles.group}>
                        <Label text="Yükseklik">
                            <BufferedInput
                                className={classNames(styles.spriteInput, htmlStyles.htmlFileNumberInput)}
                                disabled={disabled}
                                type="text"
                                value={disabled ? '' : this.state.height}
                                onSubmit={this.handleChangeHeight}
                            />
                        </Label>
                    </div>
                    <div className={styles.group}>
                        <Label text="Zoom (%)">
                            <BufferedInput
                                className={classNames(styles.spriteInput, htmlStyles.htmlFileNumberInput)}
                                disabled={disabled}
                                type="text"
                                value={disabled ? '' : (this.state.fit ? 'Oto' : this.state.zoom)}
                                onSubmit={this.handleChangeZoom}
                            />
                        </Label>
                    </div>
                </div>

                <div className={htmlStyles.presetsRow}>
                    <button className={htmlStyles.presetButton} onClick={this.handlePresetMobile} disabled={disabled}>Telefon</button>
                    <button className={htmlStyles.presetButton} onClick={this.handlePresetTablet} disabled={disabled}>Tablet</button>
                    <button className={htmlStyles.presetButton} onClick={this.handlePresetDesktop} disabled={disabled}>Masaüstü</button>
                    <button 
                        className={classNames(htmlStyles.presetButton, { [htmlStyles.presetActive]: this.state.fit })} 
                        onClick={this.handlePresetFit} 
                        disabled={disabled}
                    >
                        Sığdır
                    </button>
                </div>
            </Box>
        );
    }
}

HtmlFileInfo.propTypes = {
    disabled: PropTypes.bool,
    intl: intlShape,
    name: PropTypes.string,
    onChangeName: PropTypes.func
};

export default injectIntl(HtmlFileInfo);
