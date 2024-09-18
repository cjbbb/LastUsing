// Author: Jianbin Cui

// Track tab opening time
chrome.tabs.onCreated.addListener(function (tab) {
    chrome.storage.local.set({ [tab.id.toString()]: Date.now() });
});

// Remove stored data when tab is closed
chrome.tabs.onRemoved.addListener(function (tabId) {
    chrome.storage.local.remove(tabId.toString());
});

// Create timer
chrome.alarms.create("updateData", { periodInMinutes: 1 });

// Function to update data
function updateData() {
    chrome.tabs.query({}, function (tabs) {
        chrome.storage.local.get(null, function (items) {
            const updates = {};
            tabs.forEach(tab => {
                if (!items[tab.id.toString()]) {
                    updates[tab.id.toString()] = Date.now();
                }
            });
            if (Object.keys(updates).length > 0) {
                chrome.storage.local.set(updates);
            }
        });
    });
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "updateData") {
        updateData();
    }
});

// Update data on initialization
updateData();