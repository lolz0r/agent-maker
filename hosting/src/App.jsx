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
      <SimpleGrid gridTemplateColumns="1fr 500px" height="100vh">
        <ConversationalInterface></ConversationalInterface>
        <Box>
          <AceEditor
            width="100%"
            height="100%"
            placeholder="Agent JSON Definition"
            value={`[
              [
                {
                  type: "thought",
                  message:
                    "I need to help the user create a new AI agent using step-by-step thought, action, and observation steps.",
                },
                {
                  type: "action",
                  actionType: "talk",
                  message:
                    "I am an intelligent AI meta-agent, I am able to generate new agents based on your wishes. How can I help you?",
                },
                {
                  type: "observation",
                  from: "user",
                  message: "I want an agent to help me with dog walking",
                },
                {
                  type: "thought",
                  message:
                    "The user wants an AI agent to help them with dog walking. The purpose of the agent is a dog walking assistant. I must now determine what tools the dog walking assistant can use.",
                },
                {
                  type: "action",
                  actionType: "talk",
                  message: "What tools will the agent have access to?",
                },
                {
                  type: "observation",
                  from: "user",
                  message: "you tell me",
                },
                {
                  type: "thought",
                  message:
                    "The user has requested that I determine what tools the dog walking assistant should have access to. I should suggest tools that will help the agent complete its purpose, such as a GPS tracking system, a scheduling system, and a communication system.",
                },
                {
                  type: "action",
                  actionType: "AddTool",
                  toolName: "GPS Tracking System",
                  toolDescription:
                    "A GPS tracking system for tracking the dog's location",
                },
                {
                  type: "action",
                  actionType: "AddTool",
                  toolName: "Scheduling System",
                  toolDescription:
                    "A scheduling system for managing the dog walking schedule",
                },
                {
                  type: "action",
                  actionType: "AddTool",
                  toolName: "Communication System",
                  toolDescription:
                    "A communication system for interacting with customers",
                },
                {
                  type: "action",
                  actionType: "SetPurpose",
                  message:
                    "The purpose of the agent is to assist with dog walking.",
                },
                {
                  type: "thought",
                  message:
                    "The agent has been given the purpose of assisting with dog walking, and has access to a GPS tracking system, a scheduling system, and a communication system. I should recomend a solution and see if the user finds it acceptible",
                },
                {
                  type: "action",
                  actionType: "talk",
                  message:
                    "I recommend that the agent use the GPS tracking system to track the dog's location, the scheduling system to manage the dog walking schedule, and the communication system to interact with customers. Does this sound acceptable?",
                },
                {
                  type: "observation",
                  from: "user",
                  message: "ys",
                },
                {
                  type: "thought",
                  message:
                    "The user has accepted the solution. The agent now has access to a GPS tracking system, a scheduling system, and a communication system. The agent is now ready to be generated. To generate an agent I should use the format in this dialog to create it in JSON, complete with thoughts, observations, and actions steps. However, I should only include information directly applicable to the generated agent, not instructions that were given to me. I must include an example conversation that utilizes each of the tools added via addTool. The tool-use part of the examples must be within an 'action' step where the 'actionType' is the name of the tool. If the user requests any other changes I should use this generated agent as context.",
                },
                {
                  type: "action",
                  actionType: "SynthesizeAgent",
                  agentJSON: {
                    purpose:
                      "The purpose of the agent is to assist with dog walking.",
                    tools: [
                      {
                        name: "GPS Tracking System",
                        description:
                          "A GPS tracking system for tracking the dog's location",
                      },
                      {
                        name: "Scheduling System",
                        description:
                          "A scheduling system for managing the dog walking schedule",
                      },
                      {
                        name: "Communication System",
                        description:
                          "A communication system for interacting with customers",
                      },
                    ],
                    exampleConversation: [
                      {
                        type: "thought",
                        message: "I need to help the user with dog walking.",
                      },
                      {
                        type: "action",
                        actionType: "GPS Tracking System",
                        message:
                          "I will use the GPS tracking system to track the dog's location.",
                      },
                      {
                        type: "action",
                        actionType: "Scheduling System",
                        message:
                          "I will use the scheduling system to manage the dog walking schedule.",
                      },
                      {
                        type: "action",
                        actionType: "Communication System",
                        message:
                          "I will use the communication system to interact with customers.",
                      },
                    ],
                  },
                },
                {
                  type: "thought",
                  message: "The agent has been successfully generated.",
                },
                {
                  type: "action",
                  actionType: "talk",
                  message:
                    "The agent has been successfully generated. Is there anything else I can help you with?",
                },
              ],
            ]`}
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
