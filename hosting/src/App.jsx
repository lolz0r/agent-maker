import { useEffect, useState } from "react";
import { Box, SimpleGrid, Text, Tooltip } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import TurnEditor from "./TurnEditor";
import ConinuationPrompt from "./ContinuationPrompt";

import { store } from "./utils";
import ConversationalInterface from "./ConversationalInterface";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-kuroir";
import "ace-builds/src-noconflict/ext-language_tools";

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

  const [activeAgentJSON, setActiveAgentJSON] =
    store.useState("activeAgentJSON");

  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  return (
    <Box w="100vw">
      <SimpleGrid gridTemplateColumns="1fr 500px" height="100vh">
        <ConversationalInterface></ConversationalInterface>
        <Box>
          <AceEditor
            width="100%"
            height="100%"
            placeholder="Agent JSON Definition"
            value={activeAgentJSON ? activeAgentJSON : ""}
            mode="json"
            wrapEnabled="true"
            fontSize={14}
            showGutter={true}
            highlightActiveLine={true}
            theme="kuroir"
            onChange={() => {}}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{}}
          />
          ,
          {/*
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

          <TurnEditor
            title="Example Actions"
            dataKey="agentExamples"
          ></TurnEditor>*/}
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default App;
