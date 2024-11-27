import { useStore } from '../../store';

export const useNdk = () => {
  const ndk = useStore((state) => state.ndk);
  const initNdk = useStore((state) => state.initNdk);
  const setSigner = useStore((state) => state.setSigner);
  const constructorParams = useStore((state) => state.constructorParams);

  return {
    ndk,
    initNdk,
    setSigner,
    constructorParams,
  };
};
