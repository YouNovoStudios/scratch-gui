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
    if (!blockId) return { html: '', links: [], scripts: [] };
    const block = target.blocks.getBlock(blockId);
    if (!block) return { html: '', links: [], scripts: [] };

    let html = '';
    let links = [];
    let scripts = [];
    const indent = '  '.repeat(indentLevel);

    if (block.opcode === 'htmlblocks_divBlock') {
        html += `${indent}<div>\n`;
        if (block.inputs['SUBSTACK'] && block.inputs['SUBSTACK'].block) {
            const subRes = processBlock(block.inputs['SUBSTACK'].block, target, indentLevel + 1);
            html += subRes.html;
            links.push(...subRes.links);
            scripts.push(...subRes.scripts);
        }
        html += `${indent}</div>\n`;
    } else if (block.opcode === 'htmlblocks_h1Block') {
        const text = getArgumentText(block, 'TEXT', target);
        html += `${indent}<h1>${text}</h1>\n`;
    } else if (block.opcode === 'htmlblocks_pBlock') {
        const text = getArgumentText(block, 'TEXT', target);
        html += `${indent}<p>${text}</p>\n`;
    } else if (block.opcode === 'htmlblocks_linkStyleBlock') {
        const file = getArgumentText(block, 'FILE', target);
        links.push(file);
    } else if (block.opcode === 'htmlblocks_linkScriptBlock') {
        const file = getArgumentText(block, 'FILE', target);
        scripts.push(file);
    } else {
        // Unknown or built-in blocks just continue
    }

    if (block.next) {
        const nextRes = processBlock(block.next, target, indentLevel);
        html += nextRes.html;
        links.push(...nextRes.links);
        scripts.push(...nextRes.scripts);
    }

    return { html, links, scripts };
}

export function generateHTML(vm, targetId = null) {
    let target = null;
    if (targetId) {
        target = vm.runtime.getTargetById(targetId);
    }
    if (!target) {
        target = vm.editingTarget;
    }
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

    let bodyHtml = '';
    let allLinks = [];
    let allScripts = [];

    for (const block of topLevelBlocks) {
        const res = processBlock(block.id, target, 2);
        bodyHtml += res.html;
        allLinks.push(...res.links);
        allScripts.push(...res.scripts);
    }

    let resultHtml = `<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8">\n`;
    
    // Deduplicate links and scripts
    allLinks = [...new Set(allLinks)];
    allScripts = [...new Set(allScripts)];

    for (const link of allLinks) {
        if (link) {
            resultHtml += `  <link rel="stylesheet" href="${escapeHTML(link)}">\n`;
        }
    }
    resultHtml += `</head>\n<body>\n${bodyHtml}`;
    for (const script of allScripts) {
        if (script) {
            resultHtml += `  <script src="${escapeHTML(script)}"></script>\n`;
        }
    }
    resultHtml += `</body>\n</html>`;

    return resultHtml;
}
