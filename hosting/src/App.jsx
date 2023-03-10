import { useEffect, useState } from "react";
import { Box, Text, Tooltip } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import TurnEditor from "./TurnEditor";
import ConinuationPrompt from "./ContinuationPrompt";

import { store } from "./utils";

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

  const [agentExamples, setAgentExamples] = store.useState("agentExamples");

  useEffect(() => {
    setAgentExamples([
      { type: "observation", message: "I am a basic observation" },
      { type: "thought", message: "I am a basic thought" },
      { type: "action", message: "I am a basic action" },
    ]);
  }, []);
  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  return (
    <Box w="100vw">
      <ConinuationPrompt
        dataKey="agentPurpose"
        userQuery="What is the agent's purpose?"
        tooltip="Consicely describe the purpose of the AI chatbot."
        aiPrimer="You are instructed to help complete a user's input that determining the purpose of an AI Chatbot. Be concise."
      ></ConinuationPrompt>

      <ConinuationPrompt
        dataKey="agentRules"
        userQuery="What are the agent's Rules?"
        tooltip="Input rules that control the behavior of the bot. One rule per line."
        aiPrimer="You are instructed to help complete a user's input that determining the rules governing the behavior and process of an AI Chatbot. Be concise. One rule per line."
      ></ConinuationPrompt>

      <Text fontWeight="bold">Example Actions</Text>
      <TurnEditor dataKey="agentExamples"></TurnEditor>
    </Box>
  );
}

export default App;
