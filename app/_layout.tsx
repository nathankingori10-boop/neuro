// import { Slot, useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';

// export default function RootLayout() {
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setIsReady(true); // simulate wait for router readiness
//     }, 0); // can also use 100ms if needed

//     return () => clearTimeout(timeout);
//   }, []);

//   useEffect(() => {
//     if (isReady) {
//       router.replace('/(tabs)');
//     }
//   }, [isReady]);

//   return <Slot />;
// }





//23 october 2025

// // app/_layout.js or app/layout.js
// import { Slot } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
// import { useEffect, useState } from 'react';

// export default function RootLayout() {
//   const [checkingAuth, setCheckingAuth] = useState(true);

//   useEffect(() => {
//     const checkLogin = async () => {
//       const token = await SecureStore.getItemAsync('userToken');
//       // Just simulate auth check delay
//       setCheckingAuth(false);
//     };

//     checkLogin();
//   }, []);

//   if (checkingAuth) return null; // or a spinner/loading screen

//   return <Slot />;
// }
// import { Slot, useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
// import { useEffect, useState } from 'react';

// export default function RootLayout() {
//   const router = useRouter();
//   const [checkingAuth, setCheckingAuth] = useState(true);

//   useEffect(() => {
//     const checkLogin = async () => {
//       const token = await SecureStore.getItemAsync('userToken');
//       if (token) {
//         router.replace('/(tabs)'); // logged in → dashboard
//       } else {
//         router.replace('/(auth)/login'); // not logged in → login
//       }
//       setCheckingAuth(false);
//     };

//     checkLogin();
//   }, []);

//   if (checkingAuth) return null;

//   return <Slot />;
// }

import { Slot } from 'expo-router';

export default function RootLayout() {
  return <Slot />;
}
