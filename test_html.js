const VM = require('scratch-vm');
const { generateHTML } = require('./src/lib/html-editor/html-generator');
const vm = new VM();
vm.clear();

// Fake target
const fakeTarget = {
    blocks: {
        _blocks: {
            'div_id': {
                id: 'div_id',
                opcode: 'htmlblocks_divBlock',
                inputs: {
                    SUBSTACK: { block: 'h1_id' }
                },
                next: null,
                topLevel: true,
                x: 100,
                y: 100
            },
            'h1_id': {
                id: 'h1_id',
                opcode: 'htmlblocks_h1Block',
                inputs: {
                    TEXT: { block: 'h1_text' }
                },
                next: 'p_id',
                topLevel: false
            },
            'h1_text': {
                id: 'h1_text',
                opcode: 'text',
                fields: {
                    TEXT: { value: '<b>A&B</b>' }
                },
                topLevel: false
            },
            'p_id': {
                id: 'p_id',
                opcode: 'htmlblocks_pBlock',
                inputs: {
                    TEXT: { block: 'p_text' }
                },
                next: null,
                topLevel: false
            },
            'p_text': {
                id: 'p_text',
                opcode: 'text',
                fields: {
                    TEXT: { value: 'Dünya' }
                },
                topLevel: false
            },
            
            // Second stack
            'h1_2_id': {
                id: 'h1_2_id',
                opcode: 'htmlblocks_h1Block',
                inputs: {
                    TEXT: { block: 'h1_2_text' }
                },
                next: null,
                topLevel: true,
                x: 100,
                y: 50 // Above the first stack!
            },
            'h1_2_text': {
                id: 'h1_2_text',
                opcode: 'text',
                fields: {
                    TEXT: { value: 'Üstteki Başlık' }
                },
                topLevel: false
            },
            // Third stack: links
            'link_style_id': {
                id: 'link_style_id',
                opcode: 'htmlblocks_linkStyleBlock',
                inputs: {
                    FILE: { block: 'link_style_text' }
                },
                next: 'link_script_id',
                topLevel: true,
                x: 100,
                y: 0
            },
            'link_style_text': {
                id: 'link_style_text',
                opcode: 'text',
                fields: {
                    TEXT: { value: 'stil.css' }
                },
                topLevel: false
            },
            'link_script_id': {
                id: 'link_script_id',
                opcode: 'htmlblocks_linkScriptBlock',
                inputs: {
                    FILE: { block: 'link_script_text' }
                },
                next: null,
                topLevel: false
            },
            'link_script_text': {
                id: 'link_script_text',
                opcode: 'text',
                fields: {
                    TEXT: { value: 'script.js' }
                },
                topLevel: false
            }
        },
        getBlock: function(id) { return this._blocks[id]; }
    }
};

vm.editingTarget = fakeTarget;
const html = generateHTML(vm);
console.log(html);
