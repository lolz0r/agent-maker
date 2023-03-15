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
  const refConversationContainer = useRef(null);
  const [agentLog, setAgentLog] = useState([
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
      toolDescription: "A GPS tracking system for tracking the dog's location",
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
      toolDescription: "A communication system for interacting with customers",
    },
    {
      type: "action",
      actionType: "SetPurpose",
      message: "The purpose of the agent is to assist with dog walking.",
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
        purpose: "The purpose of the agent is to assist with dog walking.",
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
  ]);
  const [renderedAgentLog, setRenderedAgentLog] = useState([]);

  useEffect(() => {
    // get initial context
    //pushConversationTurn(null, null);
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
      <Box overflowY="scroll" height="100vh" ref={refConversationContainer}>
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
