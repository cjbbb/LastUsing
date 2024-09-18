// Author: Jianbin Cui

// Track tab opening time
chrome.tabs.onCreated.addListener(function (tab) {
    chrome.storage.local.set({ [tab.id]: Date.now() });
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
            // Update data if needed
            // This function can be used to perform any periodic updates
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