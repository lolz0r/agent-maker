import { useEffect, useState } from "react";
import { Box, SimpleGrid, Text, Tooltip } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import TurnEditor from "./TurnEditor";
import ConinuationPrompt from "./ContinuationPrompt";

import { store, parseData } from "./utils";
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

  const annotations = [];

  const rawData = `
  <data>
  <thought>Great! The agent will help you set up a dropshipping business using Shopify. I should now add tools to the agent's toolkit that will allow it to perform the necessary tasks.</thought>
  <action:AddTool>Product Research Tool: A tool that can help the agent find profitable products to sell</action:AddTool>
  <action:AddTool>Inventory Management Tool: A tool that can help the agent manage inventory levels and track sales</action:AddTool>
  <action:AddTool>Order Processing Tool: A tool that can help the agent process orders and manage shipping</action:AddTool>
  <action:AddTool>Payment Processing Tool: A tool that can help the agent process payments from customers</action:AddTool>
  <action:AddTool>Communication Tool: A tool that can help the agent communicate with customers and handle customer service inquiries</action:AddTool>
  <action:AddTool>Shopify Integration Tool: A tool that can help the agent integrate with Shopify and manage the online store</action:AddTool>
  <action:SetPurpose>The purpose of the agent is to help the user set up and manage a dropshipping business using Shopify.</action:SetPurpose>
  <thought>The agent now has all the necessary tools to help the user set up and manage a dropshipping business using Shopify. I should now add an example conversation to the agent.</thought>
  <action:AddExampleConversation>
    <thought>I am a dropshipping AI agent. I should help the user find profitable products to sell.</thought>
    <action:talk>Hi, how can I help you today?</action:talk>
    <observation:user>I'm looking for a new product to sell. Can you help me find something profitable?</observation:user>
    <thought>I should use the product research tool to find a profitable product to sell.</thought>
    <action:ProductResearchTool>Search for profitable products in the health and wellness niche</action:ProductResearchTool>
    <observation:ProductResearchTool>Product A: $20 profit margin, Product B: $15 profit margin, Product C: $25 profit margin</observation:ProductResearchTool>
    <action:talk>I found a few profitable products in the health and wellness niche. Product A has a profit margin of $20, Product B has a profit margin of $15, and Product C has a profit margin of $25. Which one would you like to sell?</action:talk>
    <observation:user>I'll go with Product C</observation:user>
    <thought>I should use the Shopify integration tool to add Product C to the user's online store.</thought>
    <action:ShopifyIntegrationTool>Add Product C to the online store</action:ShopifyIntegrationTool>
    <observation:ShopifyIntegrationTool>Product C has been added to the online store</observation:ShopifyIntegrationTool>
    <action:talk>Product C has been added to your online store. Is there anything else I can help you with?</action:talk>
    <observation:user>No, that's all for now. Thanks!</observation:user>
  </action:AddExampleConversation>
  </data>`;

  useEffect(() => {
    debugger;
    const result = parseData(rawData);
    debugger;
  }, []);

  return (
    <Box w="100vw" height="100vh">
      <PanelGroup autoSaveId="mainPanelLayout" direction="horizontal">
        <Panel defaultSize={50}>
          <ConversationalInterface></ConversationalInterface>
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
              <AceEditor
                annotations={annotations}
                setOptions={{ useWorker: false }}
                width="calc( 100% )"
                height="calc( 100% )"
                placeholder="Agent JSON Definition"
                value={activeAgentJSON}
                mode="json"
                wrapEnabled={true}
                fontSize={14}
                showGutter={true}
                highlightActiveLine={true}
                theme="kuroir"
                onChange={() => {}}
                name="jsonEditor"
                editorProps={{}}
              />
            </Panel>
            <PanelResizeHandle>
              <Box w="100%" h="5px" backgroundColor="#ddd"></Box>
            </PanelResizeHandle>
            <Panel defaultSize={50}>
              <Box w="100%" h="100%">
                <Text size="lg" fontWeight="bold" textAlign="center">
                  Generated Agent (Interactive)
                </Text>
              </Box>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </Box>
  );
}

export default App;
