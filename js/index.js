function calcSelectedLineRange(area) {
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const lastNewlineBeforeStart = area.value.lastIndexOf('\n', start - 1);
    const firstNewlineAfterEnd = area.value.indexOf('\n', end);
    return {
        start: lastNewlineBeforeStart === -1 ? 0 : lastNewlineBeforeStart + 1,
        end: firstNewlineAfterEnd === -1 ? area.value.length : firstNewlineAfterEnd,
    };
}

function replaceSelectedLinesInArea(area, lineMapper) {
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const replacingContent = area.value.substr(start, end - start);
    const replacedContent = replacingContent
        .split('\n')
        .map(lineMapper)
        .join('\n');
    area.focus();
    document.execCommand('insertText', false, replacedContent);
    return replacedContent;
}

function onRawTabKey(ev) {
    const area = ev.target;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const range = calcSelectedLineRange(area);
    area.selectionStart = range.start;
    area.selectionEnd = range.end;
    const replaced = replaceSelectedLinesInArea(ev.target, line => {
        return '  ' + line;
    });
    area.selectionStart = start + 2;
    area.selectionEnd = end + 2 * replaced.split('\n').length;
}

function onShiftTabKey(ev) {
    const area = ev.target;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const range = calcSelectedLineRange(area);
    area.selectionStart = range.start;
    area.selectionEnd = range.end;
    let startOffset = null;
    let endOffset = 0;
    const replaced = replaceSelectedLinesInArea(area, line => {
        const nonSpaceHead = line.search(/\S/);
        if (nonSpaceHead > 2) {
            endOffset += 2;
            startOffset = startOffset || 2;
            return line.substr(2);
        }
        if (nonSpaceHead === -1) {
            const offset = line.length > 2 ? 2 : line.length;
            endOffset += offset;
            startOffset = startOffset || offset;
            return line.substr(2);
        }
        endOffset += nonSpaceHead;
        startOffset = startOffset || nonSpaceHead;
        return line.trimLeft();
    });
    area.selectionStart = start - startOffset;
    area.selectionEnd = end - endOffset;
}

function onTabKey(ev) {
    ev.preventDefault();
    if (!ev.shiftKey) {
        onRawTabKey(ev);
    } else {
        onShiftTabKey(ev);
    }
}

const ITEMIZE_REGEXP = /^(\s*)(\*|-|\+|\d+\.|\[[\sx]\])\s*\S/;

function onEnterKey(ev) {
    const area = ev.target;
    const { start, end } = calcSelectedLineRange(area);
    const match = area.value.substr(start, end - start).match(ITEMIZE_REGEXP);
    if (!match) {
        return;
    }
    ev.preventDefault();
    const indent = match[1];
    let itemize = match[2].replace('[x]', '[ ]');
    const listNumberMatch = itemize.match(/^\s*(\d+)\./);
    if (listNumberMatch) {
        const n = parseInt(listNumberMatch[1]);
        itemize = n + 1 + '.';
    }
    area.focus();
    document.execCommand('insertText', false, '\n' + indent + itemize + ' ');
}

function setCallbacks(area) {
    area.addEventListener('keydown', ev => {
        switch (ev.keyCode) {
            case 9:
                onTabKey(ev);
                break;
            case 13:
                onEnterKey(ev);
                break;
        }
        return;
    });
}

function main() {
    let textareas = document.getElementsByTagName('textarea');
    if (!textareas) {
        return;
    }

    for (textarea of textareas) {
        setCallbacks(textarea);
    }
}

main();
