chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 확장 프로그램이 업데이트될 때 자동으로 리로드
chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});
