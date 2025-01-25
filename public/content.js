// 웹사이트의 localStorage에서 authStorage 가져오기
const authStorage = localStorage.getItem('authStorage');

if (authStorage) {
  try {
    // JSON 파싱
    const parsedData = JSON.parse(authStorage);

    // 필요한 데이터 추출
    const userId = parsedData.state?.user_id || null;
    const userName = parsedData.state?.user_name || null;
    const isLoggedIn = parsedData.state?.isLoggedIn || false;

    // userId와 userName, isLoggedIn 값이 있는 경우 Background Script로 전달
    chrome.runtime.sendMessage(
      { user_id: userId, user_name: userName, is_logged_in: isLoggedIn },
      (response) => {
        console.log(response);
      },
    );
  } catch (error) {
    console.error(error);
  }
}
