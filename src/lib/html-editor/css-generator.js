import { escapeHTML } from './html-generator';

function getArgumentText(block, argName, target, defaultValue = '') {
    const input = block.inputs[argName];
    if (!input || !input.block) return defaultValue;
    
    const inputBlock = target.blocks.getBlock(input.block);
    if (!inputBlock) return defaultValue;
    
    if (inputBlock.opcode === 'text' && inputBlock.fields && inputBlock.fields['TEXT']) {
        return inputBlock.fields['TEXT'].value;
    }
    if (inputBlock.opcode === 'math_number' && inputBlock.fields && inputBlock.fields['NUM']) {
        return inputBlock.fields['NUM'].value;
    }
    return defaultValue;
}

function processCssBlock(blockId, target, indentLevel) {
    if (!blockId) return { css: '', isProp: false };
    const block = target.blocks.getBlock(blockId);
    if (!block) return { css: '', isProp: false };

    let css = '';
    let isProp = true;
    const indent = '  '.repeat(indentLevel);

    if (block.opcode === 'cssblocks_selectorBlock') {
        const selector = getArgumentText(block, 'SELECTOR', target, 'h1');
        // Sanitize selector to prevent breaking out of style tag
        const safeSelector = selector.replace(/<\/style/gi, '');
        if (safeSelector.trim().length > 0) {
            css += `${indent}${safeSelector} {\n`;
            if (block.inputs['SUBSTACK'] && block.inputs['SUBSTACK'].block) {
                const subProps = processCssBlock(block.inputs['SUBSTACK'].block, target, indentLevel + 1);
                css += subProps.css;
            }
            css += `${indent}}\n`;
        }
        isProp = false;
    } else if (block.opcode === 'cssblocks_colorBlock') {
        const value = getArgumentText(block, 'VALUE', target, 'red');
        css += `${indent}color: ${value.replace(/<\/style/gi, '')};\n`;
    } else if (block.opcode === 'cssblocks_bgColorBlock') {
        const value = getArgumentText(block, 'VALUE', target, 'white');
        css += `${indent}background-color: ${value.replace(/<\/style/gi, '')};\n`;
    } else if (block.opcode === 'cssblocks_fontSizeBlock') {
        const value = getArgumentText(block, 'VALUE', target, '24');
        css += `${indent}font-size: ${value}px;\n`;
    } else if (block.opcode === 'cssblocks_paddingBlock') {
        const value = getArgumentText(block, 'VALUE', target, '10');
        css += `${indent}padding: ${value}px;\n`;
    } else if (block.opcode === 'cssblocks_marginBlock') {
        const value = getArgumentText(block, 'VALUE', target, '10');
        css += `${indent}margin: ${value}px;\n`;
    } else if (block.opcode === 'cssblocks_propBlock') {
        const prop = getArgumentText(block, 'PROP', target, 'border').replace(/<\/style/gi, '');
        const value = getArgumentText(block, 'VALUE', target, '1px solid black').replace(/<\/style/gi, '');
        css += `${indent}${prop}: ${value};\n`;
    } else {
        // Unknown blocks are skipped
        isProp = false;
    }

    if (block.next) {
        const nextRes = processCssBlock(block.next, target, indentLevel);
        css += nextRes.css;
    }

    return { css, isProp };
}

export function generateCSS(vm, targetId) {
    let target = null;
    if (targetId) {
        target = vm.runtime.getTargetById(targetId);
    }
    if (!target) return '';
    if (!target.blocks) return '';

    let topLevelIds = [];
    if (typeof target.blocks.getScripts === 'function') {
        topLevelIds = target.blocks.getScripts();
    } else {
        topLevelIds = Object.keys(target.blocks._blocks).filter(id => target.blocks._blocks[id].topLevel);
    }

    // Sort by Y, then X
    const topLevelBlocks = topLevelIds.map(id => target.blocks.getBlock(id)).filter(b => b);
    topLevelBlocks.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
    });

    let css = '';
    for (const block of topLevelBlocks) {
        const res = processCssBlock(block.id, target, 0);
        if (res.isProp) {
            // A property placed outside a selector
            css += `/* seçici dışında: ${res.css.trim()} */\n`;
        } else {
            css += res.css;
        }
    }
    return css.trim();
}
