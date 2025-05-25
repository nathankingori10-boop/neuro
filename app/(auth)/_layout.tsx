// app/(auth)/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export default function AuthLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        router.replace('/(tabs)');
      } else {
        setChecking(false); // allow rendering login/registration
      }
    };
    checkLogin();
  }, []);

  if (checking) return null;

  return <Slot />;
}

