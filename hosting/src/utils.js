export const firebaseConfig = {
  apiKey: "AIzaSyAa2bpyRoKuUviZlCVf3zMgdCm5JRt9HqQ",
  authDomain: "agent-maker.firebaseapp.com",
  projectId: "agent-maker",
  storageBucket: "agent-maker.appspot.com",
  messagingSenderId: "800988891549",
  appId: "1:800988891549:web:52204fb1368fc4a21b4774",
  measurementId: "G-XS1XE9TZHZ",
};

import { createGlobalState } from "react-hooks-global-state";

export const { useGlobalState } = createGlobalState({});

import { createStore } from "state-pool";
export const store = createStore(); // Create store for storing our global state
