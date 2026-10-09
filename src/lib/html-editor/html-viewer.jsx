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
            visible: false
        };
        this.handleToggle = this.handleToggle.bind(this);
        this.handleGenerate = this.handleGenerate.bind(this);
    }

    componentDidMount() {
        if (this.props.vm) {
            const dataUri = `data:application/javascript,${encodeURIComponent(extensionCodeText)}`;
            // TODO: Proje kaydedilip (.sb3) yeniden açılınca bu URL'in tekrar `manuallyTrustExtension` ile 
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
                        padding: '10px', width: '400px', maxHeight: '500px',
                        overflow: 'auto', color: '#000', textAlign: 'left'
                    }}>
                        <button onClick={this.handleGenerate} style={{ marginBottom: '10px', cursor: 'pointer', padding: '5px' }}>Güncelle</button>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {this.state.html || 'Henüz HTML üretilmedi. Kod alanına HTML blokları ekleyip Güncelle butonuna basın.'}
                        </pre>
                    </div>
                )}
            </div>
        );
    }
}