import React from 'react';
import {generateHTML} from './html-generator';
import {generateCSS} from './css-generator';
import htmlEditorState from './html-editor-state';

export default class HtmlPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: ''
        };
        this.handleUpdate = this.handleUpdate.bind(this);
        this.debouncedUpdate = this.debouncedUpdate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.debounceTimeout = null;
        this.containerRef = React.createRef();
        this.resizeObserver = null;
    }

    componentDidMount() {
        this.unsubscribe = htmlEditorState.subscribe(() => {
            this.handleUpdate();
        });

        if (this.props.vm) {
            this.props.vm.on('PROJECT_CHANGED', this.debouncedUpdate);
            this.props.vm.on('targetsUpdate', this.debouncedUpdate);
            htmlEditorState.updateActivePage(this.props.vm);
            this.handleUpdate();
        }

        if (this.containerRef.current) {
            this.resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    this.handleResize(entry.contentRect.width);
                }
            });
            this.resizeObserver.observe(this.containerRef.current);
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.props.vm) {
            this.props.vm.removeListener('PROJECT_CHANGED', this.debouncedUpdate);
            this.props.vm.removeListener('targetsUpdate', this.debouncedUpdate);
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
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

    handleResize(containerWidth) {
        const state = htmlEditorState.getState();
        if (state.fit && state.width > 0) {
            const fitZoom = Math.max(10, Math.min(200, Math.floor((containerWidth / state.width) * 100)));
            if (fitZoom !== state.zoom) {
                // Avoid infinite loop if zoom doesn't change
                htmlEditorState.setState({ zoom: fitZoom });
            }
        }
    }

    handleUpdate() {
        if (this.props.vm) {
            // Give state a chance to find an active page if a target was just renamed
            htmlEditorState.updateActivePage(this.props.vm);
            
            const state = htmlEditorState.getState();
            if (state.activePageId) {
                let html = generateHTML(this.props.vm, state.activePageId);
                
                // Inline CSS files for preview
                html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (match, filename) => {
                    const target = this.props.vm.runtime.targets.find(t => !t.isStage && t.sprite.name === filename);
                    if (target) {
                        const css = generateCSS(this.props.vm, target.id);
                        return `<style>\n${css}\n</style>`;
                    }
                    return `<!-- ${filename} bulunamadı -->`;
                });

                this.setState({ html });
            } else {
                this.setState({ html: null });
            }
        }
    }

    render() {
        const { width, height, zoom, activePageId } = htmlEditorState.getState();
        const scale = zoom / 100;
        
        return (
            <div ref={this.containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, overflow: 'auto', backgroundColor: '#f0f0f0' }}>
                {!activePageId ? (
                    <div style={{ padding: '20px', color: '#666' }}>Önizleme için bir .html dosyası gerekli.</div>
                ) : (
                    <div style={{ width: `${width * scale}px`, height: `${height * scale}px`, overflow: 'hidden', margin: '0 auto' }}>
                        <div style={{ width: `${width}px`, height: `${height}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                            <iframe
                                srcDoc={this.state.html || ''}
                                sandbox="allow-scripts"
                                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                                title="HTML Preview"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
