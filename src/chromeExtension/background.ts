
// Background script for the Chrome extension

// Initialize badge and icon state
chrome.runtime.onInstalled.addListener(() => {
  console.log("JobSafe extension installed");
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBadge") {
    // Update the badge with job safety score
    const score = request.score;
    let badgeText = "";
    let badgeColor = "#4CAF50"; // Green by default
    
    if (score <= 40) {
      badgeText = "!";
      badgeColor = "#F44336"; // Red for suspicious jobs
    } else if (score <= 70) {
      badgeText = "?";
      badgeColor = "#FF9800"; // Orange for uncertain jobs
    } else {
      badgeText = "✓";
    }
    
    // Update badge for the current tab
    if (sender.tab && sender.tab.id) {
      chrome.action.setBadgeText({
        text: badgeText,
        tabId: sender.tab.id
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: badgeColor,
        tabId: sender.tab.id
      });
    }
    
    sendResponse({ success: true });
    return true; // Keep the message channel open for asynchronous response
  }
  return false;
});

// Handle tab updates to reset badge when navigating away from job sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const url = tab.url || '';
    const isJobSite = 
      url.includes('linkedin.com/jobs') || 
      url.includes('indeed.com/viewjob') || 
      url.includes('monster.com/job') ||
      url.includes('glassdoor.com/job');
    
    if (!isJobSite) {
      // Clear badge when not on a job site
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});

export {}; // Make this a module
