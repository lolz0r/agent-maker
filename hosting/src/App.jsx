import { useEffect, useState } from "react";
import { Box, SimpleGrid, Text, Input } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import TurnEditor from "./TurnEditor";
import ConinuationPrompt from "./ContinuationPrompt";

import { store, parseData } from "./utils";
import ConversationalInterface from "./ConversationalInterface";
import AgentEditor from "./AgentEditor";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

import { firebaseConfig } from "./utils";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "./App.css?inline";

function App() {
  const firebaseApp = initializeApp(firebaseConfig);
  const analytics = getAnalytics(firebaseApp);
  const functions = getFunctions(firebaseApp);

  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  const [generatedAgentPrompt, setGeneratedAgentPrompt] = store.useState(
    "generatedAgentPrompt"
  );
  const [openAIAPIKey, setOpenAIAPIKey] = store.useState("openAIAPIKey");
  return (
    <SimpleGrid
      maxW="100vw"
      w="100vw"
      h="100vh"
      maxH="100vh"
      gridTemplateRows="auto 1fr"
    >
      <Box
        display="flex"
        flexDir="row"
        border="1px solid #aaa"
        alignItems="center"
        pl="10px"
        pr="10px"
      >
        <Text fontSize="xs">
          For this demo you need to provide your own OpenAI API key.
          <a target="_blank" href="https://youtu.be/yj4DVu5fGwM">
            {" "}
            See Video Demo
          </a>
        </Text>
        <Input
          size="xs"
          placeholder="OpenAI API Key (starts with sk-...)"
          value={openAIAPIKey}
          onChange={(e) => {
            setOpenAIAPIKey(e.target.value);
          }}
        ></Input>
      </Box>

      {!(openAIAPIKey && openAIAPIKey.startsWith("sk-")) && (
        <Box
          bg="rgba(0,0,0,.8)"
          position="absolute"
          top="38px"
          w="100%"
          h="100%"
          zIndex="10"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDir="column"
        >
          <Box color="white" fontSize="5xl" fontWeight="bold">
            To get started please input your OpenAI API Key
          </Box>

          <Box color="white" fontSize="md">
            <a target="_blank" href="https://youtu.be/yj4DVu5fGwM">
              View a video of this tool in action
            </a>
          </Box>
        </Box>
      )}

      <PanelGroup autoSaveId="mainPanelLayout" direction="horizontal">
        <Panel defaultSize={50}>
          <ConversationalInterface
            placeholder="Say something to the meta agent"
            allowSetMetaPrompt={true}
            allowFeedback={false}
            subAgentBG="#FFDDEE"
            agentName="Meta Agent"
            inputSubCaption="This is a demo of an AI agent that helps to generate other AI agents, a 'meta agent'"
            inititalConversationLog={[]}
          ></ConversationalInterface>
        </Panel>
        <PanelResizeHandle>
          <Box w="5px" h="100%" backgroundColor="#ddd"></Box>
        </PanelResizeHandle>

        <Panel defaultSize={50}>
          <PanelGroup direction="vertical">
            <Panel
              defaultSize={50}
              onResize={() => {
                window.dispatchEvent(new Event("resize"));
              }}
            >
              <AgentEditor></AgentEditor>
            </Panel>
            <PanelResizeHandle>
              <Box w="100%" h="5px" backgroundColor="#ddd"></Box>
            </PanelResizeHandle>
            <Panel defaultSize={50}>
              <Box w="100%" h="100%">
                {!generatedAgentPrompt && (
                  <Text>No agent has yet been generated</Text>
                )}
                {generatedAgentPrompt && (
                  <>
                    <Text size="lg" fontWeight="bold" textAlign="center">
                      Generated Agent (Interactive)
                    </Text>
                    <ConversationalInterface
                      agentPrompt={generatedAgentPrompt}
                      allowSetMetaPrompt={false}
                      allowFeedback={true}
                      agentName="Generated Agent"
                      placeholder="Say something to the generated agent"
                      inputSubCaption="This is where you can converse with the generated agent. If the agent says something that is wrong you can give feedback by prefixing '/feedback ' to your responce."
                      subAgentBG="#DDFFEE"
                    ></ConversationalInterface>
                  </>
                )}
              </Box>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </SimpleGrid>
  );
}

export default App;
