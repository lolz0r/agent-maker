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
import { firebaseConfig } from "./utils";
import ConversationTurn from "./ConversationTurn";

function ConversationalInterface({}) {
  const firebaseApp = initializeApp(firebaseConfig);
  const functions = getFunctions(firebaseApp);
  const [activeAgentJSON, setActiveAgentJSON] =
    store.useState("activeAgentJSON");

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

  const [chatLog, setChatLog] = useState([]);
  const [renderedAgentLog, setRenderedAgentLog] = useState([]);

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
      renderedLog.push({
        type: "observation",
        from: "user",
        message: turn.content,
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
                This is a demo of an AI agent that helps to generate other AI
                agents, a 'meta agent'
              </Text>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
export default ConversationalInterface;
