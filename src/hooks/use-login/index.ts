import { useStore } from '../../store';

export const useLogin = () => {
  const loginData = useStore((state) => state.loginData);
  const loginFromLocalStorage = useStore((state) => state.loginFromLocalStorage);
  const loginWithExtension = useStore((state) => state.loginWithExtension);
  const loginWithPrivateKey = useStore((state) => state.loginWithPrivateKey);
  const loginWithRemoteSigner = useStore((state) => state.loginWithRemoteSigner);
  const logout = useStore((state) => state.logout);

  return {
    loginData,
    loginFromLocalStorage,
    loginWithExtension,
    loginWithPrivateKey,
    loginWithRemoteSigner,
    logout,
  };
};
