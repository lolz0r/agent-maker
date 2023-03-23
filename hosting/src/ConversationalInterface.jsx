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

function ConversationalInterface({ inputSubCaption }) {
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
  const refProcessedTurnIDs = useRef({});

  const [userQuery, setUserQuery] = useState("");
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [showCOT, setShowCOT] = useState(true);

  const [chatLog, setChatLog] = useState([
    {
      role: "user",
      content:
        "<observation:user>make me an agent to help people sell real estate</observation:user>",
    },
    {
      role: "assistant",
      content:
        "<thought>The user wants an AI agent to help people sell real estate. The purpose of the agent is a real estate sales assistant. I must now determine what tools the real estate sales assistant can use.</thought>\n<action:talk>What tools will the agent have access to?</action:talk>\n",
    },
    {
      role: "user",
      content: "<observation:user>suggest some please</observation:user>",
    },
    {
      role: "assistant",
      content:
        "<thought>Since the agent is going to help people sell real estate, it will need access to a database of properties, a communication system to interact with potential buyers, and a payment processing system to handle transactions. I will suggest these tools to the user.</thought>\n<action:talk>The agent will need access to a database of properties, a communication system to interact with potential buyers, and a payment processing system to handle transactions. Does this sound good?</action:talk>",
    },
  ]);
  const [renderedAgentLog, setRenderedAgentLog] = useState([]);

  useEffect(() => {
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
    setGeneratedAgentPrompt(generatedPrompt);
  }, [chatLog]);

  useEffect(() => {
    // get initial context
    //pushConversationTurn(null, null);
  }, []);

  useEffect(() => {
    // extract out any turn IDs that require special client side processing
    /*
    const clientSidePendingProcessingTurns = agentLog.filter((turn) => {
      return (
        turn.type == "action" &&
        turn.actionType == "SynthesizeAgent" &&
        !Object.keys(refProcessedTurnIDs.current).includes(turn.id)
      );
    });

    clientSidePendingProcessingTurns.forEach((turn) => {
      refProcessedTurnIDs.current[turn.id] = true;
      if (turn.actionType == "SynthesizeAgent") {
        setTimeout(() => {
          const agentJSON = JSON.stringify(turn.agentJSON, null, 4);
          console.log("settting", agentJSON);
          setActiveAgentJSON(agentJSON);
        }, 100);
      }
    });

    // parse the agent log into conversation turns for easy displaying
    setRenderedAgentLog(agentLog);
    */

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
    setRenderedAgentLog(renderedLog);
  }, [chatLog]);

  async function pushConversationTurn(agentLog, userReply) {
    setIsQueryLoading(true);
    setErrorState(null);

    try {
      const vtaRes = await runChatTurn({
        userReply: userReply,
        chatLog: agentLog,
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

  return (
    <Box w="100%">
      {errorState && (
        <Box backgroundColor="red">
          <Text color="white" fontSize="xl" p="10">
            An error occured while making the request. Please try again later
          </Text>
        </Box>
      )}

      <Box>
        <SimpleGrid height="100vh" gridTemplateRows="1fr auto">
          <Stack m="2" overflowY="scroll" ref={refConversationContainer}>
            {renderedAgentLog.map((c) => (
              <ConversationTurn
                key={c.id}
                c={c}
                showCOT={showCOT}
              ></ConversationTurn>
            ))}
          </Stack>
          <Box
            border="1px solid #333"
            borderRadius="5px"
            backgroundColor="white"
          >
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
                placeholder="Say something to the agent ..."
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

            <Box p="10" backgroundColor="#ffddee">
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
        </SimpleGrid>
      </Box>
    </Box>
  );
}
export default ConversationalInterface;
