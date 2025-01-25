chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 확장 프로그램이 업데이트될 때 자동으로 리로드
chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { user_id, user_name, is_logged_in } = message;

  console.log({
    user_id,
    user_name,
    is_logged_in,
  });

  if (user_id && user_name && is_logged_in !== undefined) {
    // Chrome Storage에 데이터 저장
    chrome.storage.local.set({ user_id, user_name, is_logged_in }, () => {
      console.log({
        user_id,
        user_name,
        is_logged_in,
      });
    });

    sendResponse({ status: 'success' });
  } else {
    console.log(message);
    sendResponse({ status: 'error', message });
  }
});
