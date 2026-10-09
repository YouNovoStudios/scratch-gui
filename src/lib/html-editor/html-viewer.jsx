import React from 'react';
import { generateHTML } from './html-generator';
import { manuallyTrustExtension } from '../../containers/tw-security-manager.jsx';
// We load the extension code as raw text to pass to loadExtensionURL
// import extensionCodeText from 'raw-loader!./html-extension.js'; 
// Alternatively, since raw-loader might need webpack config changes, 
// we just read a pre-built string.

const extensionCodeText = `
class HtmlExtension {
    getInfo() {
        return {
            id: 'htmlblocks',
            name: 'HTML',
            color1: '#E44D26',
            color2: '#F16529',
            blocks: [
                { opcode: 'divBlock', blockType: 'conditional', text: 'div', branchCount: 1 },
                { opcode: 'h1Block', blockType: 'command', text: 'başlık [TEXT]', arguments: { TEXT: { type: 'string', defaultValue: 'Metin' } } },
                { opcode: 'pBlock', blockType: 'command', text: 'paragraf [TEXT]', arguments: { TEXT: { type: 'string', defaultValue: 'Metin' } } }
            ]
        };
    }
    divBlock() { return; } h1Block() { return; } pBlock() { return; }
}
Scratch.extensions.register(new HtmlExtension());
`;

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
    }

    componentDidMount() {
        if (this.props.vm) {
            const dataUri = `data:application/javascript,${encodeURIComponent(extensionCodeText)}`;
            // TODO: Proje kaydedilip (.sb3) yeniden açılınca bu URL'in tekrar \`manuallyTrustExtension\` ile 
            // güvenilir işaretlenmesi gerekir; aksi takdirde izin penceresi çıkabilir veya yüklenmeyebilir.
            manuallyTrustExtension(dataUri);
            this.props.vm.extensionManager.loadExtensionURL(dataUri)
                .catch(err => console.error("HTML Extension failed to load:", err));
        }
    }

    handleGenerate() {
        if (this.props.vm) {
            const result = generateHTML(this.props.vm);
            this.setState({ html: result });
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
                                <iframe 
                                    srcDoc={this.state.html || '<p>Henüz HTML üretilmedi.</p>'} 
                                    sandbox="" 
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="HTML Preview"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}