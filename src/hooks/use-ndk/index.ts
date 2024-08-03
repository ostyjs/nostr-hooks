import { useStore } from 'src/store';

export const useNdk = () => {
  const ndk = useStore((state) => state.ndk);
  const setNdk = useStore((state) => state.setNdk);

  return { ndk, setNdk };
};
