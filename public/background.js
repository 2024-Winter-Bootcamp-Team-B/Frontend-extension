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

      fetchBlockedSites(user_id);
    });

    sendResponse({ status: 'success' });
  } else {
    console.log(message);
    sendResponse({ status: 'error', message });
  }
});

// 차단된 사이트 목록 가져오기 및 동적 규칙 업데이트

// FastAPI에서 차단된 사이트 목록 가져오기 및 동적 규칙 업데이트
async function fetchBlockedSites(user_id) {
  if (!user_id) {
    return;
  }
  try {
    // FastAPI에서 차단 목록 가져오기
    const response = await fetch(
      `http://127.0.0.1:8000/lock/blocked-site/${user_id}`,
    );
    const data = await response.json();

    // 유효성 검사
    if (!data.sites || !Array.isArray(data.sites)) {
      throw new Error(
        "Invalid API response: 'sites' is missing or not an array.",
      );
    }

    // 차단할 사이트 정리
    const sanitizedSites = data.sites
      .map((site) =>
        site
          .trim()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/$/, ''),
      )
      .filter((site) => site.includes('.')); // 유효한 도메인만 포함

    console.log('Sanitized sites:', sanitizedSites);

    // 동적 규칙 생성
    const rules = sanitizedSites.map((site, index) => ({
      id: index + 1000, // 규칙 ID (1000 이상 고유값)
      priority: 1, // 우선순위
      action: { type: 'block' }, // 차단 동작
      condition: { urlFilter: site, resourceTypes: ['main_frame', 'script'] },
    }));

    // 기존 규칙 확인 및 제거
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map((rule) => rule.id);

    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds, // 기존 규칙 제거
        addRules: [], // 규칙 추가 없음
      });
      console.log('Removed existing rules:', existingRuleIds);
    }

    // 새로운 규칙 추가
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules, // 새로운 규칙 추가
    });

    console.log('Updated blocked rules:', rules);
  } catch (error) {
    console.error('Failed to fetch or update blocked sites:', error);
  }
}

// 확장 프로그램 설치 시 초기화
chrome.runtime.onInstalled.addListener(() => {
  console.log('Site Blocker extension installed');

  // Chrome Storage에서 저장된 userId 가져오기
  chrome.storage.local.get(['user_id'], (result) => {
    if (result.user_id) {
      fetchBlockedSites(result.user_id);
    } else {
      console.log('No user_id found in storage.');
    }
  });
});

// 차단 목록 업데이트 (user_id를 Chrome Storage에서 가져와서 사용)
setInterval(async () => {
  try {
    chrome.storage.local.get(['user_id'], (result) => {
      if (result && result.user_id) {
        console.log(`User ID retrieved: ${result.user_id}`);
        fetchBlockedSites(result.user_id); // 정상적인 방식으로 user_id 전달
      } else {
        console.warn(
          'User ID is not set. Skipping scheduled fetchBlockedSites.',
        );
      }
    });
  } catch (error) {
    console.error('Error retrieving user_id from Chrome storage:', error);
  }
}, 1800);
