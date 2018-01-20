let lastClearTimer;
function saveOptions() {
    const blacklists = document.getElementById('blacklists').value.split('\n');
    chrome.storage.sync.set(
        {
            blacklists,
        },
        () => {
            const status = document.getElementById('status');
            status.textContent = '...saved';
            if (lastClearTimer) {
                clearTimeout(lastClearTimer);
            }
            lastClearTimer = setTimeout(() => {
                status.textContent = '';
            }, 750);
        },
    );
}

function restoreOptions() {
    chrome.storage.sync.get(
        {
            blacklists: [],
        },
        items => {
            console.log(items.blacklists);
            document.getElementById('blacklists').value = items.blacklists.join('\n');
        },
    );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('blacklists').addEventListener('input', saveOptions);
document.getElementById('save').addEventListener('click', saveOptions);
