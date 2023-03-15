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
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "./App.css";

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
    <Box w="100vw" height="100vh">
      <PanelGroup autoSaveId="mainPanelLayout" direction="horizontal">
        <Panel defaultSize={50}>
          <ConversationalInterface></ConversationalInterface>
        </Panel>
        <PanelResizeHandle>
          <Box w="10px"></Box>
        </PanelResizeHandle>

        <Panel defaultSize={50}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={50}>
              <AceEditor
                width="100%"
                height="100%"
                placeholder="Agent JSON Definition"
                value={activeAgentJSON ? activeAgentJSON : ""}
                mode="json"
                wrapEnabled={true}
                fontSize={14}
                showGutter={true}
                highlightActiveLine={true}
                theme="kuroir"
                onChange={() => {}}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{}}
              />
            </Panel>
            <PanelResizeHandle>
              <Box w="100%" h="10px"></Box>
            </PanelResizeHandle>
            <Panel defaultSize={50}>
              <Box w="100%" h="100%" backgroundColor="#222"></Box>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </Box>
  );
}

export default App;
