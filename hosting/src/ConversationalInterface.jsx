import { useEffect, useState } from "react";

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
} from "@chakra-ui/react";

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

  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  const virtualMakerAgentTurn = httpsCallable(
    functions,
    "virtualMakerAgentTurn"
  );

  const [userQuery, setUserQuery] = useState("");

  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [showCOT, setShowCOT] = useState(true);

  const [agentLog, setAgentLog] = useState([]);
  const [renderedAgentLog, setRenderedAgentLog] = useState([]);

  useEffect(() => {
    // get initial context
    pushConversationTurn(null, null);
  }, []);

  useEffect(() => {
    // parse the agent log into conversation turns for easy displaying
    setRenderedAgentLog(agentLog);
  }, [agentLog]);

  async function pushConversationTurn(agentLog, userReply) {
    setIsQueryLoading(true);
    setErrorState(null);

    try {
      const vtaRes = await virtualMakerAgentTurn({
        userReply: userReply,
        agentLog: agentLog,
      });

      setAgentLog(vtaRes.data.agentLog);

      console.log(vtaRes.data);

      setTimeout(() => {
        window.scrollTo(0, window.document.body.scrollHeight);
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
        <Stack direction="column">
          <Stack m="2">
            {renderedAgentLog.map((c) => (
              <ConversationTurn
                key={c.message}
                c={c}
                showCOT={showCOT}
              ></ConversationTurn>
            ))}
          </Stack>
          <Box
            border="1px solid #333"
            borderRadius="5px"
            position="sticky"
            bottom="0px"
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
                    pushConversationTurn(agentLog, userQuery);
                  }
                }}
                onChange={(event) => {
                  setUserQuery(event.target.value);
                }}
              />
            </InputGroup>

            <Box p="10" backgroundColor="#ffddee">
              <Switch
                mb="3"
                isChecked={showCOT}
                onChange={(e) => {
                  setShowCOT(e.target.checked);
                }}
              >
                Show Agent's Chain of Thought
              </Switch>
              <Text fontSize="sm" color="gray">
                This is a demo of an AI agent that helps to generate other AI
                agents, a 'meta agent'
              </Text>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
export default ConversationalInterface;
