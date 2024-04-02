import tw from 'twin.macro';
import astronautLogo from '../assets/astronaut.svg';
import nfidLogo from '../assets/nfid.svg';
import { useIdentityStore } from '../stores/identityStore';
import { handlePromise } from '../utils/handlers';
import Tooltip from './Tooltip';

export const LoginAreaButton = tw.div`p-3 border-2 text-xl rounded-full cursor-pointer bg-[#fff8] hover:bg-gray-100`;

export interface LoginAreaProps {
  label?: boolean;
}

export default function LoginArea({ label }: LoginAreaProps) {
  const loginII = useIdentityStore((state) => state.loginInternetIdentity);

  const wrapLogin = (promise: Promise<any>) => {
    return handlePromise(
      promise,
      // 'Signing in...',
      undefined,
      'Error while signing in!',
    );
  };

  return (
    <div tw="flex gap-1 items-center">
      <Tooltip content="Internet Identity">
        <LoginAreaButton
          onClick={() => wrapLogin(loginII())}
          tw="flex items-center justify-center w-[48px] h-[48px]"
        >
            Login
        </LoginAreaButton>
      </Tooltip>
    </div>
  );
}
