import { useEffect, useState } from 'react';
import { BlockReq, blockSites } from './api/block';
import jail from './assets/jail.svg';
import dayjs from 'dayjs';
import TimePicker from 'react-time-picker';
import axios from 'axios';
import { fetchMostBlocked } from './api/mostBlocked';
import { checkBlock, checkReq } from './api/checkBlock';

const App = () => {
  const today = dayjs().format('YYYY년 MM월 DD일'); // dayjs 라이브러리로 오늘 날짜 가져오기
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>(dayjs().format('HH:mm'));
  const [goalTime, setGoalTime] = useState<string>(
    dayjs().add(1, 'hour').format('HH:mm'),
  );
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlList, setUrlList] = useState<{ url: string; name: string }[]>([]);
  const [mostBlocked, setMostBlocked] = useState<string[]>([]);
  const [blockedSites, setBlockedSites] = useState<string[]>([]); // 차단된 사이트 목록
  const [iconPositions, setIconPositions] = useState<
    { x: number; y: number }[]
  >([]);
  const [iconVelocities, setIconVelocities] = useState<
    { dx: number; dy: number }[]
  >([]);

  const handleStartTimeChange = (value: string | null) => {
    setStartTime(value || dayjs().format('HH:mm'));
  };

  const handleGoalTimeChange = (value: string | null) => {
    setGoalTime(value || dayjs().add(1, 'hour').format('HH:mm'));
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

  // 감옥 내부 하드코딩된 좌표 범위 (임의로 설정 가능)
  const JAIL_X_MIN = 45; // 감옥 내부 X 최소 위치
  const JAIL_X_MAX = 330; // 감옥 내부 X 최대 위치
  const JAIL_Y_MIN = 570; // 감옥 내부 Y 최소 위치
  const JAIL_Y_MAX = 810; // 감옥 내부 Y 최대 위치

  // 차단된 사이트 가져오기
  useEffect(() => {
    if (!userId) return;
    const check: checkReq = { user_id: parseInt(userId) };
    checkBlock(check)
      .then((response) => {
        if (response?.sites) {
          setBlockedSites(response.sites);
          // 감옥 내부 랜덤한 위치로 아이콘 배치 (하드코딩된 범위 내에서만 생성)
          setIconPositions(
            response.sites.map(() => ({
              x: Math.random() * (JAIL_X_MAX - JAIL_X_MIN) + JAIL_X_MIN,
              y: Math.random() * (JAIL_Y_MAX - JAIL_Y_MIN) + JAIL_Y_MIN,
            })),
          );
          // 랜덤한 방향으로 초기 속도 설정
          setIconVelocities(
            response.sites.map(() => ({
              dx: (Math.random() - 0.5) * 15, // 속도 조정 가능
              dy: (Math.random() - 0.5) * 15,
            })),
          );
        }
      })
      .catch((error) => console.error('Error fetching blocked sites:', error));
  }, [userId]);
  // 아이콘이 감옥 내부에서 움직이도록 애니메이션 설정
  useEffect(() => {
    const interval = setInterval(() => {
      setIconPositions((prevPositions) =>
        prevPositions.map((pos, index) => {
          const velocity = iconVelocities[index];
          let newX = pos.x + velocity.dx;
          let newY = pos.y + velocity.dy;
          // 감옥 내부 경계 확인 후 반대 방향으로 튕기기
          if (newX < JAIL_X_MIN || newX > JAIL_X_MAX - 50) {
            velocity.dx *= -1;
            newX = Math.max(JAIL_X_MIN, Math.min(newX, JAIL_X_MAX - 50));
          }
          if (newY < JAIL_Y_MIN || newY > JAIL_Y_MAX - 50) {
            velocity.dy *= -1;
            newY = Math.max(JAIL_Y_MIN, Math.min(newY, JAIL_Y_MAX - 50));
          }
          return { x: newX, y: newY };
        }),
      );
    }, 25); // 50ms 간격으로 업데이트
    return () => clearInterval(interval);
  }, [iconVelocities]);

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
      <div className='font-abril flex text-xl gap-8'>
        <TimePicker
          onChange={handleStartTimeChange}
          value={startTime}
          disableClock={true}
          clearIcon={null}
          format='HH:mm'
          className='w-[100px]'
          hourPlaceholder='00'
          minutePlaceholder='00'
        />
        <p>~</p>
        <TimePicker
          onChange={handleGoalTimeChange}
          value={goalTime}
          disableClock={true}
          clearIcon={null}
          format='HH:mm'
          className='w-[100px]'
          hourPlaceholder='00'
          minutePlaceholder='00'
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
        {/* 감옥 이미지 */}
        <img
          src={jail}
          style={{
            width: '90vw',
            maxWidth: '1000px',
            height: 'auto',
            zIndex: 2,
          }}
        />

        {/* 아이콘 */}
        {blockedSites.map((site, index) => (
          <img
            key={site}
            src={`https://www.google.com/s2/favicons?sz=32&domain_url=${site}`}
            alt={site}
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              top: iconPositions[index]?.y || 0,
              left: iconPositions[index]?.x || 0,
              cursor: 'pointer',
              zIndex: 1, // 감옥 아래 배치
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
