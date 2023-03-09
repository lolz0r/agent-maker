import { useState } from "react";
import { Box } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import ConinuationBox from "./ContinuationBox";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

import { firebaseConfig } from "./utils";

function App() {
  const firebaseApp = initializeApp(firebaseConfig);
  const analytics = getAnalytics(firebaseApp);
  const functions = getFunctions(firebaseApp);

  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  //const virtualTATurn = httpsCallable(functions, "virtualTATurn");

  return (
    <Box w="100%">
      <ConinuationBox primer="You are an agent tasked with creating other agents"></ConinuationBox>
    </Box>
  );
}

export default App;
