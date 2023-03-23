import { useEffect, useRef, useState } from "react";

import {
  Button,
  Stack,
  Text,
  Input,
  Box,
  Grid,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
  Switch,
  SimpleGrid,
} from "@chakra-ui/react";
import { store } from "./utils";

import { initializeApp } from "firebase/app";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { firebaseConfig, parseData } from "./utils";
import ConversationTurn from "./ConversationTurn";

function ConversationalInterface({
  inputSubCaption,
  agentPrompt,
  allowSetMetaPrompt,
  placeholder,
  subAgentBG,
  inititalConversationLog,
}) {
  const firebaseApp = initializeApp(firebaseConfig);
  const functions = getFunctions(firebaseApp);
  const [generatedAgentPrompt, setGeneratedAgentPrompt] = store.useState(
    "generatedAgentPrompt"
  );

  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  const runChatTurn = httpsCallable(functions, "runChatTurn");

  const refConversationContainer = useRef(null);

  const [userQuery, setUserQuery] = useState("");
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [showCOT, setShowCOT] = useState(true);

  const [chatLog, setChatLog] = useState([]);
  const [formattedChatLog, setFormattedChatLog] = useState([]);

  async function pushConversationTurn(agentLog, userReply) {
    setIsQueryLoading(true);
    setErrorState(null);

    try {
      const vtaRes = await runChatTurn({
        userReply: userReply,
        chatLog: agentLog,
        agentPrompt: agentPrompt,
      });
      setChatLog(vtaRes.data.chatLog);

      setTimeout(() => {
        refConversationContainer.current.scrollTop =
          refConversationContainer.current.scrollHeight;
      }, 200);
    } catch (ex) {
      console.log("caught error", ex);
      setErrorState(ex);
    }

    setUserQuery("");
    setIsQueryLoading(false);
  }
  useEffect(() => {
    if (!allowSetMetaPrompt) {
      return;
    }
    // generate a prompt from the log, if applicable
    let generatedPrompt = "";

    let agentPurpose = "";
    let agentTools = [];
    let agentRules = [];
    let agentExampleConversations = [];
    chatLog.forEach((turn) => {
      // parse the content of the turn
      const turnContents = parseData(`<data>${turn.content}</data>`);
      turnContents.forEach((t) => {
        if (t.type == "action") {
          if (t.actionType == "SetAgentPrompt") {
            agentPurpose = t.content;
          }
          if (t.actionType == "AddTool") {
            const [name, description] = t.content.split(":");
            agentTools.push({ name, description });
          }
          if (t.actionType == "AddRule") {
            agentRules.push(t.content);
          }
          if (t.actionType == "AddExampleConversation") {
            agentExampleConversations.push(t.innerText);
          }
        }
      });
    });
    // now render the contents
    generatedPrompt = `${agentPurpose}
Rules:
${agentRules.map((rule, idx) => `${idx}. ${rule}\n`).join("")}
You have the following tools:
${agentTools
  .map((tool) => `<action:${tool.name}> ... ${tool.description}\n`)
  .join("")}

${agentExampleConversations
  .map(
    (conversation) => `Example Conversation:
===
${conversation}
===
`
  )
  .join("")}  
`;
    if (agentExampleConversations.length > 0) {
      setGeneratedAgentPrompt(generatedPrompt);
    }
  }, [chatLog]);

  useEffect(() => {
    if (inititalConversationLog && inititalConversationLog.length > 0) {
      setChatLog(inititalConversationLog);
    }
  }, [inititalConversationLog]);

  useEffect(() => {
    let renderedLog = [];
    chatLog.forEach((turn) => {
      // parse the content of the turn
      const turnContents = parseData(`<data>${turn.content}</data>`);
      turnContents.forEach((t) => {
        if (t.type == "observation") {
          renderedLog.push({
            type: t.type,
            from: t.observationSource,
            message: t.content,
          });
        }
        if (t.type == "action") {
          console.log(t);
          renderedLog.push({
            type: t.type,
            message: t.content,
            actionType: t.actionType,
          });
        }
        if (t.type == "thought") {
          renderedLog.push({
            type: t.type,
            message: t.content,
          });
        }
      });
    });
    setFormattedChatLog(renderedLog);
  }, [chatLog]);

  return (
    <Box w="100%" h="100%" display="flex">
      {errorState && (
        <Box backgroundColor="red">
          <Text color="white" fontSize="xl" p="10">
            An error occured while making the request. Please try again later
          </Text>
        </Box>
      )}

      <Grid height="100%" width="100%" templateRows="1fr auto">
        <Stack m="2" overflowY="scroll" ref={refConversationContainer}>
          {formattedChatLog.map((c) => (
            <ConversationTurn
              key={c.id}
              c={c}
              showCOT={showCOT}
            ></ConversationTurn>
          ))}
        </Stack>
        <Box border="1px solid #333" borderRadius="5px" backgroundColor="white">
          {isQueryLoading && (
            <Box p="3" display="flex" flexDir="row" gap="10px">
              <Spinner></Spinner>
              <Text>The agent is thinking...</Text>
            </Box>
          )}

          <InputGroup size="md">
            <Input
              isDisabled={isQueryLoading}
              variant="outline"
              placeholder={placeholder}
              value={userQuery}
              onKeyDown={async (event) => {
                if (event.key === "Enter" && userQuery.length > 0) {
                  pushConversationTurn(chatLog, userQuery);
                }
              }}
              onChange={(event) => {
                setUserQuery(event.target.value);
              }}
            />
          </InputGroup>

          <Box p="10" backgroundColor={subAgentBG}>
            <Box display="flex" flexDir="row" alignContent="center">
              <Switch
                mb="3"
                isChecked={showCOT}
                onChange={(e) => {
                  setShowCOT(e.target.checked);
                }}
              ></Switch>
              <Text ml="5px" fontSize="sm">
                Show Agent's Chain of Thought
              </Text>
            </Box>

            <Text fontSize="sm" color="gray">
              {inputSubCaption}
            </Text>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
export default ConversationalInterface;
