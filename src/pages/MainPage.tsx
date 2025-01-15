import GoogleLogin from '../assets/googleLogin.png';
import jail from '../assets/jail.svg';
import dayjs from 'dayjs';

const MainPage = () => {
  const today = dayjs().format('YYYY년 MM월 DD일'); // dayjs 라이브러리로 오늘 날짜 가져오기
  return (
    <div className='flex flex-col h-full w-full p-4 items-center gap-2'>
      <div className='flex gap-6'>
        <div className='flex flex-col'>
          <p className='font-cinzel font-bold text-focus-color text-4xl'>
            FOCUS
          </p>
          <div>
            <p>Filter Out Chaos,</p>
            <p>Unlock Success!</p>
          </div>
        </div>
        <div className='flex items-center'>
          <img src={GoogleLogin} className='w-[160px]' />
        </div>
      </div>
      <p className='text-xl'>{today}</p>
      <div className='font-abril flex text-xl gap-8'>
        <p>01:30</p>
        <p>~</p>
        <p>21:00</p>
      </div>
      <p>URL을 입력하세요</p>
      <div className='flex flex-col w-[300px] gap-2 items-center'>
        <input
          type='url'
          placeholder='URL 예시'
          className='h-10 p-5 placeholder:text-center w-full'
          style={{
            boxShadow:
              '-2px -2px 4px 0px rgba(239, 237, 225, 0.50) inset, 2px 2px 4px 0px rgba(170, 170, 204, 0.25) inset, 5px 5px 10px 0px rgba(170, 170, 204, 0.50) inset, -5px -5px 10px 0px #FFF inset',
            borderRadius: '30px',
          }}
        />
        <button
          className='bg-white rounded-3xl w-24 h-12'
          style={{
            boxShadow:
              '0px 2px 8px 0px rgba(40, 41, 61, 0.08), 0px 20px 32px 0px rgba(96, 97, 112, 0.24)',
          }}
        >
          차단하기
        </button>
        <div className='flex justify-between w-full'>
          <button
            className='bg-white rounded-3xl w-24 h-12'
            style={{
              boxShadow:
                '0px 2px 8px 0px rgba(40, 41, 61, 0.08), 0px 20px 32px 0px rgba(96, 97, 112, 0.24)',
            }}
          >
            차단 해제
          </button>
          <button
            className='bg-white rounded-3xl w-24 h-12'
            style={{
              boxShadow:
                '0px 2px 8px 0px rgba(40, 41, 61, 0.08), 0px 20px 32px 0px rgba(96, 97, 112, 0.24)',
            }}
          >
            통계 보러가기
          </button>
        </div>
        <img src={jail} className='w-full' />
      </div>
    </div>
  );
};

export default MainPage;
