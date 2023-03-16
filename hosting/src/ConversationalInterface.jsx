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

  const virtualMakerAgentTurn = httpsCallable(
    functions,
    "virtualMakerAgentTurn"
  );

  const refConversationContainer = useRef(null);
  const refProcessedTurnIDs = useRef({});

  const [userQuery, setUserQuery] = useState("");
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [showCOT, setShowCOT] = useState(true);

  const [agentLog, setAgentLog] = useState([
    {
      type: "thought",
      message:
        "I need to help the user create a new AI agent using step-by-step thought, action, and observation steps.",
      id: "3c5c0a06-c433-4158-92e6-f67aaeb859b4",
    },
    {
      type: "action",
      actionType: "talk",
      message:
        "I am an intelligent AI meta-agent, I am able to generate new agents based on your wishes. How can I help you?",
      id: "981037c7-692d-4b70-8283-b29b66eb9ab1",
    },
    {
      type: "observation",
      from: "user",
      message: "I want an agent to help me with dog walking",
      id: "f44f8dea-51a9-410a-b536-56de53eda77d",
    },
    {
      type: "thought",
      message:
        "The user wants an AI agent to help them with dog walking. The purpose of the agent is a dog walking assistant. I must now determine what tools the dog walking assistant can use.",
      id: "a768eebb-01fe-4ba6-8c96-d9125fda1d30",
    },
    {
      type: "action",
      actionType: "talk",
      message: "What tools will the agent have access to?",
      id: "ba73afcb-747d-4d47-b7b3-b10f9d2fd833",
    },
    {
      type: "observation",
      from: "user",
      message: "you tell me",
      id: "b846faf1-fa70-4d32-b7f5-d2e691f590ec",
    },
    {
      type: "thought",
      message:
        "The user has requested that I determine what tools the dog walking assistant should have access to. I should suggest tools that will help the agent complete its purpose, such as a GPS tracking system, a scheduling system, and a communication system.",
      id: "ba229cc3-e9f6-442a-9ff6-5ffff155fd7c",
    },
    {
      type: "action",
      actionType: "AddTool",
      toolName: "GPS Tracking System",
      toolDescription: "A GPS tracking system for tracking the dog's location",
      id: "40859e24-b902-4841-8d73-0d5f4bc8cf6a",
    },
    {
      type: "action",
      actionType: "AddTool",
      toolName: "Scheduling System",
      toolDescription:
        "A scheduling system for managing the dog walking schedule",
      id: "51ccd0a6-85dc-422b-aff2-85c4df89388c",
    },
    {
      type: "action",
      actionType: "AddTool",
      toolName: "Communication System",
      toolDescription: "A communication system for interacting with customers",
      id: "dfb86406-104d-4cd0-b92a-c95091fb6816",
    },
    {
      type: "action",
      actionType: "SetPurpose",
      message: "The purpose of the agent is to assist with dog walking.",
      id: "701d4b1c-d466-4d75-aa02-667fc314644d",
    },
    {
      type: "thought",
      message:
        "The agent has been given the purpose of assisting with dog walking, and has access to a GPS tracking system, a scheduling system, and a communication system. I should recomend a solution and see if the user finds it acceptible",
      id: "0d196b52-fe61-4bbe-be53-6ef2eb447332",
    },
    {
      type: "action",
      actionType: "talk",
      message:
        "I recommend that the agent use the GPS tracking system to track the dog's location, the scheduling system to manage the dog walking schedule, and the communication system to interact with customers. Does this sound acceptable?",
      id: "97dfd96f-e6eb-4c5e-a6a1-28a6c2b4607e",
    },
  ]);
  const [renderedAgentLog, setRenderedAgentLog] = useState([]);

  useEffect(() => {
    // get initial context
    //pushConversationTurn(null, null);
  }, []);

  useEffect(() => {
    // extract out any turn IDs that require special client side processing
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
                    pushConversationTurn(agentLog, userQuery);
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
