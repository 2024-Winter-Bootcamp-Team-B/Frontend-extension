import Logo from '../components/Logo';
import GoogleLogin from '../assets/googleLogin.png';

const LoginPage = () => {
  return (
    <div className='flex flex-col h-full'>
      <Logo />
      <img src={GoogleLogin} className='' />
    </div>
  );
};

export default LoginPage;
