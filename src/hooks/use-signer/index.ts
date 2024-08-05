import { useStore } from '../../store';

export const useSigner = () => {
  const ndk = useStore((state) => state.ndk);
  const setSigner = useStore((state) => state.setSigner);

  const signer = ndk.signer;

  return { signer, setSigner };
};
