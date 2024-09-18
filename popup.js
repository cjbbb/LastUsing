// Author: Jianbin Cui

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const tabs = await chrome.tabs.query({});
        const items = await chrome.storage.local.get(null);
        const tabList = document.getElementById('tabList');
        const infoMessage = document.getElementById('infoMessage');

        // Display info message
        infoMessage.textContent = "All tabs are sorted by their opening time, from earliest to latest. This helps you decide which tabs to close.";

        const tabsInfo = tabs
            .filter(tab => !/onetab/i.test(tab.title))
            .map(tab => ({
                id: tab.id,
                title: tab.title,
                url: tab.url,
                openTime: items[tab.id] || Date.now()
            }))
            .sort((a, b) => a.openTime - b.openTime);  // Sort by opening time, earliest first

        tabsInfo.forEach(function ({ id, title, url }) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="tab-title" title="${title}" data-tab-id="${id}">${title}</span>
                <button class="close-btn" data-tab-id="${id}" title="Close tab">×</button>
            `;
            tabList.appendChild(li);
        });

        // Add event listeners for jumping to tabs
        document.querySelectorAll('.tab-title').forEach(title => {
            title.addEventListener('click', async function () {
                const tabId = parseInt(this.getAttribute('data-tab-id'));
                await chrome.tabs.update(tabId, { active: true });
                await chrome.windows.update((await chrome.tabs.get(tabId)).windowId, { focused: true });
                window.close(); // Close the popup after switching
            });
        });

        // Add event listeners for closing tabs
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const tabId = parseInt(this.getAttribute('data-tab-id'));
                await chrome.tabs.remove(tabId);
                this.closest('li').remove();
            });
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
});