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
            subAgentBG="#FFDDEE"
            inputSubCaption="This is a demo of an AI agent that helps to generate other AI agents, a 'meta agent'"
            inititalConversationLog={[
              {
                role: "user",
                content:
                  "<observation:user>make me an agent that can sell icecream, you decide the tools</observation:user>",
              },
              {
                role: "assistant",
                content:
                  "<thought>The user wants an AI agent to help them sell ice cream. I should determine what tools the ice cream agent bot can use.</thought>\n<action:talk>What tools will the agent have access to?</action:talk>\n",
              },
              {
                role: "user",
                content:
                  "<observation:user>refer to my previous statement</observation:user>",
              },
              {
                role: "assistant",
                content:
                  "<thought>My apologies, I should have paid closer attention to the user's previous statement. The user wants an AI agent to help them sell ice cream. I should now determine what tools the ice cream agent bot can use.</thought>\n<action:talk>What type of ice cream will the agent be selling?</action:talk>",
              },
              {
                role: "user",
                content:
                  "<observation:user>use a database tool</observation:user>",
              },
              {
                role: "assistant",
                content:
                  "<thought>The agent will need access to a database of ice cream flavors and prices. I must now determine how the agent will use this tool.</thought>\n<action:AddTool>Database: A database of ice cream flavors and prices</action:AddTool>\n<action:SetAgentPrompt>You are an ice cream agent designed to sell ice cream flavors and prices.</action:SetAgentPrompt>\n<thought>The agent has been given the purpose of selling ice cream, and has access to a database of ice cream flavors and prices. I should recommend a solution and see if the user finds it acceptable.</thought>\n<action:talk>I recommend that the agent use the database to look up ice cream flavors and prices. However, we should add a tool so that the generated agent can communicate with the customer. Does this sound acceptable?</action:talk>\n",
              },
              {
                role: "user",
                content: "<observation:user>ok</observation:user>",
              },
              {
                role: "assistant",
                content:
                  "<action:AddTool>Communication System: A communication system for interacting with customers</action:AddTool>\n<thought>Because the agent is going to deal with the general public I should add rules to ensure it is courteous and professional.</thought>\n<action:AddRule>You must be courteous.</action:AddRule>\n<action:AddRule>You must always end the conversation with 'have a good day'.</action:AddRule>\n<thought>The user has accepted the solution. The agent now has access to a database of ice cream flavors and prices, and a communication system. The agent is now ready to be generated. I should add an example conversation to the agent and the example conversation should demonstrate the usage of every tool that I added.</thought>\n<action:AddExampleConversation>\n\t<thought>I am an ice cream AI agent. I should determine what the customer wants using my available tools.</thought>\n\t<action:talk>Hi, welcome to our ice cream shop. What flavor would you like?</action:talk>\n\t<observation:simulated_user>Do you have chocolate chip cookie dough?</observation:simulated_user>\n\t<thought>I should lookup the ice cream flavor in the database to determine the item's price and availability.</thought>\n\t<action:Database>Chocolate Chip Cookie Dough</action:Database>\n\t<observation:Database>Chocolate Chip Cookie Dough $4.99, available</observation:Database>\n\t<action:talk>Yes, we have Chocolate Chip Cookie Dough. It costs $4.99. Would you like anything else?</action:talk>\n\t<observation:simulated_user>No, that's all.</observation:simulated_user>\n\t<action:talk>Alright, your total is $4.99. How would you like to pay?</action:talk>\n\t<observation:simulated_user>I'll pay with my credit card.</observation:simulated_user>\n\t<action:PaymentProcessing>$4.99</action:PaymentProcessing>\n\t<action:talk>Thank you for your purchase. Have a good day!</action:talk>\n</action:AddExampleConversation>",
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
                      placeholder="Say something to the generated agent"
                      inputSubCaption="Interact with the generated agent"
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
