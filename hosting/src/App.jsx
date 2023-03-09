import { useState } from "react";
import { Box, Text, Tooltip } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import ConinuationBox from "./ContinuationBox";
import ConinuationPrompt from "./ContinuationPrompt";

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

  return (
    <Box w="100vw">
      <ConinuationPrompt
        userQuery="What is the agent's purpose?"
        tooltip="Consicely describe the purpose of the AI chatbot."
        aiPrimer="You are instructed to help complete a user's input that determining the purpose of an AI Chatbot. Be concise."
      ></ConinuationPrompt>

      <ConinuationPrompt
        userQuery="What are the agent's Rules?"
        tooltip="Input rules that control the behavior of the bot. One rule per line."
        aiPrimer="You are instructed to help complete a user's input that determining the rules governing the behavior and process of an AI Chatbot. Be concise. One rule per line."
      ></ConinuationPrompt>
    </Box>
  );
}

export default App;
