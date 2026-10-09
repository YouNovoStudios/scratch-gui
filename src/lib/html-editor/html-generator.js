export function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            default: return '&#039;';
        }
    });
}

function getArgumentText(block, argName, target) {
    const input = block.inputs[argName];
    if (!input || !input.block) return '';
    
    const inputBlock = target.blocks.getBlock(input.block);
    if (!inputBlock) return '';
    
    if (inputBlock.opcode === 'text' && inputBlock.fields && inputBlock.fields['TEXT']) {
        return escapeHTML(inputBlock.fields['TEXT'].value);
    }
    return '<!-- desteklenmiyor -->';
}

function processBlock(blockId, target, indentLevel) {
    if (!blockId) return '';
    const block = target.blocks.getBlock(blockId);
    if (!block) return '';

    let html = '';
    const indent = '  '.repeat(indentLevel);

    if (block.opcode === 'htmlblocks_divBlock') {
        html += `${indent}<div>\n`;
        if (block.inputs['SUBSTACK'] && block.inputs['SUBSTACK'].block) {
            html += processBlock(block.inputs['SUBSTACK'].block, target, indentLevel + 1);
        }
        html += `${indent}</div>\n`;
    } else if (block.opcode === 'htmlblocks_h1Block') {
        const text = getArgumentText(block, 'TEXT', target);
        html += `${indent}<h1>${text}</h1>\n`;
    } else if (block.opcode === 'htmlblocks_pBlock') {
        const text = getArgumentText(block, 'TEXT', target);
        html += `${indent}<p>${text}</p>\n`;
    } else {
        // Unknown or built-in blocks just continue
    }

    if (block.next) {
        html += processBlock(block.next, target, indentLevel);
    }

    return html;
}

export function generateHTML(vm) {
    const target = vm.editingTarget;
    if (!target || !target.blocks) return '';

    let topLevelIds = [];
    if (typeof target.blocks.getScripts === 'function') {
        topLevelIds = target.blocks.getScripts();
    } else {
        // Fallback method using _blocks
        topLevelIds = Object.keys(target.blocks._blocks).filter(id => target.blocks._blocks[id].topLevel);
    }

    // Sort by Y, then X
    const topLevelBlocks = topLevelIds.map(id => target.blocks.getBlock(id)).filter(b => b);
    topLevelBlocks.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
    });

    let html = '';
    for (const block of topLevelBlocks) {
        html += processBlock(block.id, target, 0);
    }
    return html.trim();
}
