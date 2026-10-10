import { manuallyTrustExtension } from '../../containers/tw-security-manager.jsx';

const htmlExtensionCodeText = `
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
                { opcode: 'pBlock', blockType: 'command', text: 'paragraf [TEXT]', arguments: { TEXT: { type: 'string', defaultValue: 'Metin' } } },
                { 
                    opcode: 'linkStyleBlock', 
                    blockType: 'command', 
                    text: 'stil bağla [FILE]', 
                    arguments: { FILE: { type: 'string', menu: 'cssFiles' } } 
                },
                { 
                    opcode: 'linkScriptBlock', 
                    blockType: 'command', 
                    text: 'betik bağla [FILE]', 
                    arguments: { FILE: { type: 'string', menu: 'jsFiles' } } 
                }
            ],
            menus: {
                cssFiles: {
                    acceptReporters: true,
                    items: 'getCssFiles'
                },
                jsFiles: {
                    acceptReporters: true,
                    items: 'getJsFiles'
                }
            }
        };
    }
    
    getCssFiles() {
        if (!window.vm) return ['style.css'];
        const targets = window.vm.runtime.targets.filter(t => !t.isStage && /\.css$/i.test(t.sprite.name));
        if (targets.length === 0) return ['stil.css'];
        return targets.map(t => ({ text: t.sprite.name, value: t.sprite.name }));
    }

    getJsFiles() {
        if (!window.vm) return ['script.js'];
        const targets = window.vm.runtime.targets.filter(t => !t.isStage && /\.js$/i.test(t.sprite.name));
        if (targets.length === 0) return ['betik.js'];
        return targets.map(t => ({ text: t.sprite.name, value: t.sprite.name }));
    }

    divBlock() { return; } 
    h1Block() { return; } 
    pBlock() { return; }
    linkStyleBlock() { return; }
    linkScriptBlock() { return; }
}
Scratch.extensions.register(new HtmlExtension());
`;

const cssExtensionCodeText = `
class CssExtension {
    getInfo() {
        return {
            id: 'cssblocks',
            name: 'CSS',
            color1: '#1971C2',
            color2: '#1864AB',
            color3: '#0B7285',
            blocks: [
                { opcode: 'selectorBlock', blockType: 'conditional', text: 'seçici [SELECTOR]', branchCount: 1, arguments: { SELECTOR: { type: 'string', defaultValue: 'h1' } } },
                { opcode: 'colorBlock', blockType: 'command', text: 'renk [VALUE]', arguments: { VALUE: { type: 'string', defaultValue: 'red' } } },
                { opcode: 'bgColorBlock', blockType: 'command', text: 'arka plan rengi [VALUE]', arguments: { VALUE: { type: 'string', defaultValue: 'white' } } },
                { opcode: 'fontSizeBlock', blockType: 'command', text: 'yazı boyutu [VALUE] px', arguments: { VALUE: { type: 'number', defaultValue: 24 } } },
                { opcode: 'paddingBlock', blockType: 'command', text: 'iç boşluk [VALUE] px', arguments: { VALUE: { type: 'number', defaultValue: 10 } } },
                { opcode: 'marginBlock', blockType: 'command', text: 'dış boşluk [VALUE] px', arguments: { VALUE: { type: 'number', defaultValue: 10 } } },
                { opcode: 'propBlock', blockType: 'command', text: 'özellik [PROP] : [VALUE]', arguments: { PROP: { type: 'string', defaultValue: 'border' }, VALUE: { type: 'string', defaultValue: '1px solid black' } } }
            ]
        };
    }
    selectorBlock() { return; }
    colorBlock() { return; }
    bgColorBlock() { return; }
    fontSizeBlock() { return; }
    paddingBlock() { return; }
    marginBlock() { return; }
    propBlock() { return; }
}
Scratch.extensions.register(new CssExtension());
`;

export function loadHtmlEditorExtensions(vm) {
    if (!vm) return;
    
    const loadExt = (codeText, id) => {
        const dataUri = `data:application/javascript,${encodeURIComponent(codeText)}`;
        manuallyTrustExtension(dataUri);
        vm.extensionManager.loadExtensionURL(dataUri)
            .catch(err => console.error(`Extension ${id} failed to load:`, err));
    };

    loadExt(htmlExtensionCodeText, 'HTML');
    loadExt(cssExtensionCodeText, 'CSS');
}
