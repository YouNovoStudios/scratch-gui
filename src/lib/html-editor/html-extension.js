class HtmlExtension {
    getInfo() {
        return {
            id: 'htmlblocks',
            name: 'HTML',
            color1: '#E44D26',
            color2: '#F16529',
            blocks: [
                {
                    opcode: 'divBlock',
                    blockType: 'conditional',
                    text: 'div',
                    branchCount: 1
                },
                {
                    opcode: 'h1Block',
                    blockType: 'command',
                    text: 'başlık [TEXT]',
                    arguments: {
                        TEXT: {
                            type: 'string',
                            defaultValue: 'Metin'
                        }
                    }
                },
                {
                    opcode: 'pBlock',
                    blockType: 'command',
                    text: 'paragraf [TEXT]',
                    arguments: {
                        TEXT: {
                            type: 'string',
                            defaultValue: 'Metin'
                        }
                    }
                }
            ]
        };
    }
    divBlock() { return; }
    h1Block() { return; }
    pBlock() { return; }
}
Scratch.extensions.register(new HtmlExtension());
