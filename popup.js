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
                openTime: items[tab.id.toString()] || Date.now()
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
                adjustPopupHeight(); // 在关闭标签后调整高度
            });
        });

        // 添加以下代码来调整弹出窗口的高度
        adjustPopupHeight();

    } catch (error) {
        console.error('An error occurred:', error);
    }
});

// 添加这个新函数来调��弹出窗口的高度
function adjustPopupHeight() {
    const header = document.querySelector('.header');
    const content = document.querySelector('.content');
    const footer = document.querySelector('.footer');
    const infoMessage = document.getElementById('infoMessage');
    const tabList = document.getElementById('tabList');

    // 计算信息文本的实际高度
    const infoMessageHeight = infoMessage.offsetHeight;

    // 计算标签列表的高度
    const tabListHeight = tabList.offsetHeight;

    // 计算总高度，包括页眉、信息文本、标签列表和页脚
    const totalHeight = header.offsetHeight + infoMessageHeight + tabListHeight + footer.offsetHeight + 16; // 添加16px作为内边距

    const maxHeight = 640;

    if (totalHeight < maxHeight) {
        document.body.style.height = totalHeight + 'px';
        content.style.height = (totalHeight - header.offsetHeight - footer.offsetHeight) + 'px';
    } else {
        document.body.style.height = maxHeight + 'px';
        content.style.height = (maxHeight - header.offsetHeight - footer.offsetHeight) + 'px';
    }
}