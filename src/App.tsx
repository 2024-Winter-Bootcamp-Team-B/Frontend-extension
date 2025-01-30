import { useEffect, useState } from 'react';
import { BlockReq, blockSites } from './api/block';
import jail from './assets/jail.svg';
import dayjs from 'dayjs';
import { TimePicker } from 'rsuite';
import axios from 'axios';
import { fetchMostBlocked } from './api/mostBlocked';

const App = () => {
  const today = dayjs().format('YYYY년 MM월 DD일'); // dayjs 라이브러리로 오늘 날짜 가져오기
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [goalTime, setGoalTime] = useState<Date | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlList, setUrlList] = useState<{ url: string; name: string }[]>([]);
  const [mostBlocked, setMostBlocked] = useState<string[]>([]);

  const handleStartTimeChange = (value: Date | null) => {
    setStartTime(value || null);
  };

  const handleGoalTimeChange = (value: Date | null) => {
    setGoalTime(value || null);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  // axios를 사용하여 사이트 이름 가져오기
  const fetchSiteName = async (url: string) => {
    try {
      const response = await axios.get(`https://${url}`, {
        responseType: 'text', // HTML 데이터를 텍스트로 가져오기
      });
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/html');
      const siteName = doc.querySelector('title')?.textContent || url;
      return siteName;
    } catch (error) {
      console.error(error);
      return url; // URL을 기본값으로 사용
    }
  };

  // URL 추가
  const handleAddUrl = async () => {
    if (!urlInput) {
      return;
    }
    const siteName = await fetchSiteName(urlInput); // 사이트 이름 가져오기
    const newEntry = { url: urlInput, name: siteName }; // URL과 사이트 이름 저장
    setUrlList((prevList) => [...prevList, newEntry]); // 리스트에 추가
    setUrlInput('');
  };

  useEffect(() => {
    // Chrome Storage에서 user_id, user_name, is_logged_in 가져오기
    chrome.storage.local.get(
      ['user_id', 'user_name', 'is_logged_in'],
      (result) => {
        if (result.user_id && result.user_name && result.is_logged_in) {
          setUserId(result.user_id);
          setUserName(result.user_name);
          setIsLoggedIn(result.is_logged_in);
          console.log(result);
        }
      },
    );
  }, []);

  const handleBlock = () => {
    const todayDate = dayjs().format('YYYY-MM-DD');
    if (!userId) return; // userId가 null이면 API 호출하지 않음

    // 동적으로 userId를 포함한 block 객체 생성
    const block: BlockReq = {
      user_id: parseInt(userId, 10), // userId를 숫자로 변환
      start_time: dayjs(`${todayDate}T${startTime}`).toISOString(),
      goal_time: dayjs(`${todayDate}T${goalTime}`).toISOString(),
      sites: urlList.map((entry) => entry.url), // URL 리스트만 전송
    };

    // API 호출
    blockSites(block)
      .then((response) => {
        if (response) {
          console.log(response);
          alert('차단이 되었습니다.');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('오류가 발생하였습니다. 다시 시도해주세요.');
      });
  };

  // 최고 빈도 사이트 5개 API
  useEffect(() => {
    fetchMostBlocked()
      .then((response) => {
        if (response?.result && Array.isArray(response.result)) {
          setMostBlocked(response.result);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  // 드래그 시작 핸들러
  const handleDragStart = (
    e: React.DragEvent<HTMLImageElement>,
    url: string,
  ) => {
    e.dataTransfer.setData('text/plain', url);
  };

  // 드롭 핸들러
  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const droppedUrl = e.dataTransfer.getData('text/plain');
    if (droppedUrl) {
      fetchSiteName(droppedUrl).then((siteName) => {
        setUrlList((prevList) => [
          ...prevList,
          { url: droppedUrl, name: siteName },
        ]);
      });
    }
  };

  // 드래그 오버 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  return (
    <div className='flex flex-col h-full w-full p-4 items-center gap-2'>
      <div className='flex items-center justify-between w-full'>
        <div className='flex flex-col'>
          <p className='font-cinzel font-bold text-focus-color text-4xl'>
            FOCUS
          </p>
          <div>
            <p>Filter Out Chaos,</p>
            <p>Unlock Success!</p>
          </div>
        </div>
        {isLoggedIn ? (
          <p className='text-lg'>WELCOME, {userName}</p>
        ) : (
          <button
            className='text-xl'
            onClick={() =>
              chrome.tabs.create({ url: 'http://localhost:5173/login' })
            }
          >
            LOGIN
          </button>
        )}
      </div>
      <p className='text-xl'>{today}</p>
      <p>시간을 입력하세요</p>
      <div className='font-abril flex items-center text-xl gap-8'>
        <TimePicker
          onChange={handleStartTimeChange}
          value={startTime}
          cleanable={false}
          size='sm'
          placeholder=''
        />
        <p>~</p>
        <TimePicker
          onChange={handleGoalTimeChange}
          value={goalTime}
          cleanable={false}
          size='sm'
          placeholder=''
        />
      </div>
      <p>URL을 입력하거나 아이콘을 드래그하세요</p>
      <div className='flex gap-4 w-full'>
        <input
          type='url'
          value={urlInput}
          onChange={handleUrlChange}
          onDrop={handleDrop} // 드롭 이벤트 처리
          onDragOver={handleDragOver} // 드래그 오버 이벤트 처리
          placeholder='예: www.focus-on-site.com'
          className='h-10 p-5 placeholder:text-center flex-grow'
          style={{
            boxShadow:
              '-2px -2px 4px 0px rgba(239, 237, 225, 0.50) inset, 2px 2px 4px 0px rgba(170, 170, 204, 0.25) inset, 5px 5px 10px 0px rgba(170, 170, 204, 0.50) inset, -5px -5px 10px 0px #FFF inset',
            borderRadius: '30px',
          }}
        />
        <button
          onClick={handleAddUrl}
          className='bg-white rounded-3xl w-10 h-10 text-sm flex-shrink-0 active:bg-[#E5E5F0]'
          style={{
            boxShadow:
              '0px 2px 8px 0px rgba(40, 41, 61, 0.08), 0px 20px 32px 0px rgba(96, 97, 112, 0.24)',
          }}
        >
          추가
        </button>
      </div>
      <div className='flex justify-between bg-[#F5F5FA] p-3 self-center rounded-[30px] w-full'>
        {mostBlocked.map((site, index) => (
          <img
            key={index}
            src={`https://www.google.com/s2/favicons?sz=32&domain_url=${site}`}
            draggable
            onDragStart={(e) => handleDragStart(e, site)} // 드래그 시작 이벤트
          />
        ))}
      </div>
      <div className='w-full'>
        <ul className='flex flex-wrap gap-4 w-full justify-start'>
          {urlList.map((entry, index) => (
            <li
              key={index}
              className='flex items-center gap-2 flex-shrink-0 basis-[calc(50%-8px)] max-w-[calc(50%-8px)]'
            >
              <img
                src={`https://www.google.com/s2/favicons?sz=32&domain_url=${entry.url}`}
              />
              <p>{entry.name}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className='mt-auto flex flex-col items-center gap-4'>
        <button
          className='bg-white rounded-3xl w-28 h-10 text-sm active:bg-[#E5E5F0]'
          onClick={handleBlock}
          style={{
            boxShadow:
              '0px 2px 8px 0px rgba(40, 41, 61, 0.08), 0px 20px 32px 0px rgba(96, 97, 112, 0.24)',
          }}
        >
          차단하기
        </button>
        <div className='flex justify-between w-full'>
          <button
            className='bg-white rounded-3xl w-28 h-10 text-sm active:bg-[#E5E5F0]'
            onClick={() =>
              chrome.tabs.create({ url: 'http://localhost:5173/photo' })
            }
            style={{
              boxShadow:
                '0px 2px 8px 0px rgba(40, 41, 61, 0.08), 0px 20px 32px 0px rgba(96, 97, 112, 0.24)',
            }}
          >
            차단 해제
          </button>
          <button
            className='bg-white rounded-3xl w-28 h-10 text-sm active:bg-[#E5E5F0]'
            onClick={() =>
              chrome.tabs.create({ url: 'http://localhost:5173/#stats' })
            }
            style={{
              boxShadow:
                '0px 2px 8px 0px rgba(40, 41, 61, 0.08), 0px 20px 32px 0px rgba(96, 97, 112, 0.24)',
            }}
          >
            통계 보기
          </button>
        </div>
        <img src={jail} className='w-full' />
      </div>
    </div>
  );
};

export default App;
