import { useEffect } from 'react';

import { useLogin } from '../use-login';

export const useAutoLogin = () => {
  const { loginFromLocalStorage } = useLogin();

  useEffect(() => {
    loginFromLocalStorage();
  }, [loginFromLocalStorage]);
};
