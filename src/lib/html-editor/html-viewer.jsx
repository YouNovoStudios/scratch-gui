import React from 'react';
import { generateHTML } from './html-generator';
import { generateCSS } from './css-generator';
import htmlEditorState from './html-editor-state';
import { loadHtmlEditorExtensions } from './extensions-loader';

export default class HtmlViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: '',
            visible: false,
            activeTab: 'code' // 'code' veya 'preview'
        };
        this.handleToggle = this.handleToggle.bind(this);
        this.handleGenerate = this.handleGenerate.bind(this);
        this.setTab = this.setTab.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.containerRef = React.createRef();
        this.resizeObserver = null;
    }

    componentDidMount() {
        this.unsubscribe = htmlEditorState.subscribe(() => {
            if (this.state.visible && this.state.activeTab === 'preview') {
                this.handleGenerate();
            }
        });
        if (this.props.vm) {
            loadHtmlEditorExtensions(this.props.vm);
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
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    handleGenerate() {
        if (this.props.vm) {
            htmlEditorState.updateActivePage(this.props.vm);
            const state = htmlEditorState.getState();
            if (state.activePageId) {
                const result = generateHTML(this.props.vm, state.activePageId);
                this.setState({ html: result });
            } else {
                this.setState({ html: null });
            }
        }
    }

    getPreviewHtml() {
        if (!this.state.html) return '';
        let html = this.state.html;
        html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (match, filename) => {
            const target = this.props.vm.runtime.targets.find(t => !t.isStage && t.sprite.name === filename);
            if (target) {
                const css = generateCSS(this.props.vm, target.id);
                return `<style>\n${css}\n</style>`;
            }
            return `<!-- ${filename} bulunamadı -->`;
        });
        return html;
    }

    handleResize(containerWidth) {
        if (this.state.activeTab !== 'preview') return;
        const state = htmlEditorState.getState();
        if (state.fit && state.width > 0) {
            const fitZoom = Math.max(10, Math.min(200, Math.floor((containerWidth / state.width) * 100)));
            if (fitZoom !== state.zoom) {
                htmlEditorState.setState({ zoom: fitZoom });
            }
        }
    }

    handleToggle() {
        this.setState(prev => ({ visible: !prev.visible }));
    }

    setTab(tab) {
        this.setState({ activeTab: tab });
    }

    render() {
        return (
            <div style={{ position: 'relative', zIndex: 9999 }}>
                <button
                    onClick={this.handleToggle}
                    style={{ margin: '0 10px', padding: '0.5rem 1rem', background: '#FF4D4D', color: 'white', borderRadius: '4px', cursor: 'pointer', border: 'none' }}>
                    {this.state.visible ? 'Gizle HTML' : 'HTML Göster'}
                </button>
                {this.state.visible && (
                    <div style={{
                        position: 'absolute', top: '40px', left: 0,
                        backgroundColor: '#fff', border: '2px solid #333',
                        padding: '10px', width: '450px', maxHeight: '550px',
                        overflow: 'auto', color: '#000', textAlign: 'left', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div>
                                <button 
                                    onClick={() => this.setTab('code')}
                                    style={{ fontWeight: this.state.activeTab === 'code' ? 'bold' : 'normal', padding: '5px', cursor: 'pointer' }}>
                                    Kod Görünümü
                                </button>
                                <button 
                                    onClick={() => this.setTab('preview')}
                                    style={{ fontWeight: this.state.activeTab === 'preview' ? 'bold' : 'normal', padding: '5px', cursor: 'pointer', marginLeft: '5px' }}>
                                    Canlı Önizleme
                                </button>
                            </div>
                            <button onClick={this.handleGenerate} style={{ cursor: 'pointer', padding: '5px' }}>Güncelle</button>
                        </div>
                        
                        <div style={{ flex: 1, minHeight: '300px', border: '1px solid #ccc', padding: '10px' }}>
                            {this.state.activeTab === 'code' ? (
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                    {this.state.html || 'Henüz HTML üretilmedi. Kod alanına HTML blokları ekleyip Güncelle butonuna basın.'}
                                </pre>
                            ) : (
                                <div ref={this.containerRef} style={{ width: '100%', height: '100%', overflow: 'auto', backgroundColor: '#f0f0f0' }}>
                                    {!htmlEditorState.getState().activePageId ? (
                                        <div style={{ padding: '20px', color: '#666' }}>Önizleme için bir .html dosyası gerekli.</div>
                                    ) : (
                                        <div style={{ 
                                            width: `${htmlEditorState.getState().width * (htmlEditorState.getState().zoom / 100)}px`, 
                                            height: `${htmlEditorState.getState().height * (htmlEditorState.getState().zoom / 100)}px`, 
                                            overflow: 'hidden', margin: '0 auto' 
                                        }}>
                                            <div style={{ 
                                                width: `${htmlEditorState.getState().width}px`, 
                                                height: `${htmlEditorState.getState().height}px`, 
                                                transform: `scale(${htmlEditorState.getState().zoom / 100})`, 
                                                transformOrigin: 'top left' 
                                            }}>
                                                <iframe 
                                                    srcDoc={this.getPreviewHtml()} 
                                                    sandbox="allow-scripts" 
                                                    style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                                                    title="HTML Preview"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}