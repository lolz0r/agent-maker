import { useEffect, useState } from "react";
import { Box, SimpleGrid, Text, Tooltip } from "@chakra-ui/react";

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
  return (
    <Box w="100vw" height="100vh">
      <PanelGroup autoSaveId="mainPanelLayout" direction="horizontal">
        <Panel defaultSize={50}>
          <ConversationalInterface
            placeholder="Say something to the meta agent"
            allowSetMetaPrompt={true}
            allowFeedback={false}
            subAgentBG="#FFDDEE"
            agentName="Meta Agent"
            inputSubCaption="This is a demo of an AI agent that helps to generate other AI agents, a 'meta agent'"
            inititalConversationLog={[
              {
                role: "user",
                type: "observation",
                from: "user",
                content: "<observation:user>hello</observation:user>",
                message: "hello",
                id: "94942a52-2ba6-4e32-b8f7-39e7dab72d9f",
              },
              {
                role: "assistant",
                type: "thought",
                content:
                  "<thought>The user has initiated contact. I should respond with a greeting.</thought>",
                message:
                  "The user has initiated contact. I should respond with a greeting.",
                id: "8abf61bc-1b53-40b5-b82d-e461131c4432",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:talk>Hello! How can I assist you today?</action:talk>",
                actionType: "talk",
                message: "Hello! How can I assist you today?",
                id: "7dc15c64-39fa-45c4-bfc8-86f0b67c35a4",
              },
              {
                role: "user",
                type: "observation",
                from: "user",
                content:
                  "<observation:user>I wnat an agent to help me sell icecream</observation:user>",
                message: "I wnat an agent to help me sell icecream",
                id: "7bc6a13b-350a-46d6-8675-3c9c720148a8",
              },
              {
                role: "assistant",
                type: "thought",
                content:
                  "<thought>The user wants an AI agent to help them sell ice cream. The purpose of the agent is an ice cream selling bot. I must now determine what tools the ice cream agent bot can use.</thought>",
                message:
                  "The user wants an AI agent to help them sell ice cream. The purpose of the agent is an ice cream selling bot. I must now determine what tools the ice cream agent bot can use.",
                id: "80169f60-0d47-4265-8916-2bd0c0eeb255",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:talk>What tools will the agent have access to?</action:talk>",
                actionType: "talk",
                message: "What tools will the agent have access to?",
                id: "5d9d5b70-bd58-482d-8caf-ce427ace0bf6",
              },
              {
                role: "user",
                type: "observation",
                from: "user",
                content: "<observation:user>u tell me</observation:user>",
                message: "u tell me",
                id: "a38dd886-db83-44df-9e61-6e6b7bb1a2ad",
              },
              {
                role: "assistant",
                type: "thought",
                content:
                  "<thought>The user has left the decision of tools to me. I should recommend a set of tools that will be useful for an ice cream selling bot.</thought>",
                message:
                  "The user has left the decision of tools to me. I should recommend a set of tools that will be useful for an ice cream selling bot.",
                id: "3acdd35d-6681-4785-9710-7c4a02a1a1a2",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:talk>I recommend that the agent have access to a database of ice cream flavors and prices, a payment processing system, and a communication system for interacting with customers. Does this sound acceptable?</action:talk>",
                actionType: "talk",
                message:
                  "I recommend that the agent have access to a database of ice cream flavors and prices, a payment processing system, and a communication system for interacting with customers. Does this sound acceptable?",
                id: "a6e34469-c7f7-4bd2-a327-58347d2ff802",
              },
              {
                role: "user",
                type: "observation",
                from: "user",
                content: "<observation:user>k</observation:user>",
                message: "k",
                id: "0b6c834d-5b62-467a-b565-017869bdfa4a",
              },
              {
                role: "assistant",
                type: "thought",
                content:
                  "<thought>The user has accepted the recommended tools. I should now add these tools to the agent's toolkit.</thought>",
                message:
                  "The user has accepted the recommended tools. I should now add these tools to the agent's toolkit.",
                id: "6bf29fd0-65c9-40ab-9dda-302cc22b61a3",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:AddTool>Database: A database of ice cream flavors and prices</action:AddTool>",
                actionType: "AddTool",
                message: "Database: A database of ice cream flavors and prices",
                id: "48262a90-c2c5-4472-a46d-0aa610eda6d8",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:AddTool>Payment Processing System: A payment processing system for taking payments from customers</action:AddTool>",
                actionType: "AddTool",
                message:
                  "Payment Processing System: A payment processing system for taking payments from customers",
                id: "7fccfe87-5fb4-45c7-b5e5-02b792fb2491",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:AddTool>Communication System: A communication system for interacting with customers</action:AddTool>",
                actionType: "AddTool",
                message:
                  "Communication System: A communication system for interacting with customers",
                id: "ea4dbced-abb3-48ef-a6ef-63351ebb87bf",
              },
              {
                role: "assistant",
                type: "thought",
                content:
                  "<thought>Now that the agent has access to the necessary tools, I should add some rules to ensure that the agent behaves professionally and courteously.</thought>",
                message:
                  "Now that the agent has access to the necessary tools, I should add some rules to ensure that the agent behaves professionally and courteously.",
                id: "6432ccd7-af24-486e-bdb6-f917c2a6b304",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:AddRule>You must greet the customer politely.</action:AddRule>",
                actionType: "AddRule",
                message: "You must greet the customer politely.",
                id: "52f20c63-9673-458e-917c-f67acd58f7fd",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:AddRule>You must always end the conversation with 'have a nice day'.</action:AddRule>",
                actionType: "AddRule",
                message:
                  "You must always end the conversation with 'have a nice day'.",
                id: "2b76b2b0-e373-426c-a611-e4ca531ec9a8",
              },
              {
                role: "assistant",
                type: "thought",
                content:
                  "<thought>The agent is now ready to be generated. I should add an example conversation to the agent and the example conversation should demonstrate the usage of every tool that I added.</thought>",
                message:
                  "The agent is now ready to be generated. I should add an example conversation to the agent and the example conversation should demonstrate the usage of every tool that I added.",
                id: "17a5b864-a51d-460c-83c8-e228f4c3c740",
              },
              {
                role: "assistant",
                type: "action",
                content:
                  "<action:AddExampleConversation>\n\t<thought>I am an ice cream AI agent. I should determine what the customer wants using my available tools.</thought>\n\t<action:talk>Hello, welcome to our ice cream shop! What can I get for you today?</action:talk>\n\t<observation:simulated_user>I would like a scoop of chocolate ice cream.</observation:simulated_user>\n\t<thought>I should lookup the item in the menu-database to determine the item's price and availability.</thought>\n\t<action:Database>Chocolate ice cream</action:Database>\n\t<observation:Database>Chocolate ice cream is available and costs $2.50.</observation:Database>\n\t<action:talk>Great choice! One scoop of chocolate ice cream costs $2.50. Would you like anything else?</action:talk>\n\t<observation:simulated_user>No, that's all.</observation:simulated_user>\n\t<action:PaymentProcessing>$2.50</action:PaymentProcessing>\n\t<action:talk>Thank you for your purchase! Have a nice day!</action:talk>\n</action:AddExampleConversation>",
                actionType: "AddExampleConversation",
                message:
                  "I am an ice cream AI agent. I should determine what the customer wants using my available tools.\n\tHello, welcome to our ice cream shop! What can I get for you today?\n\tI would like a scoop of chocolate ice cream.\n\tI should lookup the item in the menu-database to determine the item's price and availability.\n\tChocolate ice cream\n\tChocolate ice cream is available and costs $2.50.\n\tGreat choice! One scoop of chocolate ice cream costs $2.50. Would you like anything else?\n\tNo, that's all.\n\t$2.50\n\tThank you for your purchase! Have a nice day!",
                id: "6bc5f5e1-c3cb-4ea5-b6e9-6000bef96e0a",
              },
            ]}
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
    </Box>
  );
}

export default App;
