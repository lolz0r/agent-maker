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
import ConversationLineBreak from "./ConversationLineBreak";

function ConversationalInterface({
  inputSubCaption,
  agentPrompt,
  allowSetMetaPrompt,
  placeholder,
  subAgentBG,
  inititalConversationLog,
  agentName,
  allowFeedback,
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
  const parseMessageContents = httpsCallable(functions, "parseMessageContents");
  const runGPTCompletion = httpsCallable(functions, "runGPTCompletion");

  const refConversationContainer = useRef(null);

  const [userQuery, setUserQuery] = useState("");
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [showCOT, setShowCOT] = useState(true);

  const [chatLog, setChatLog] = useState([]);
  const [formattedChatLog, setFormattedChatLog] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  async function processUserFeedback(userFeedback) {
    let prompt = `CONVERSATION:
    ####
    ${
      chatLog.map((turn) =>
        JSON.stringify({ content: turn.content, role: turn.role })
      ) + "\n"
    }
    ####

    Agent Specs:
=========
${generatedAgentPrompt}
=========


How would you change the aforementioned rules based on this feedback: "${userFeedback}"? Render the updated rules within the original agent spec, verbosely. (include rules, tool descriptions, and any existing Example Conversations) \n
    `;
    setIsQueryLoading(true);
    const r = await runGPTCompletion({ prompt: prompt });

    setGeneratedAgentPrompt(r.data.response.text);
    setUserQuery("");
    setIsQueryLoading(false);
  }

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
    let agentRules = [
      "Don't make up anything. Only use information obtained from observations.",
      "To get information always use a tool.",
      "Format all responses with the proper tags, like <action:talk>...</action:talk>",
      "Always use tools before making any claim.",
      "Always end your conversation turn with <action:Talk>...",
    ];
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
${agentRules.map((rule, idx) => `${idx + 1}. ${rule}\n`).join("")}
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
    if (
      inititalConversationLog &&
      inititalConversationLog.length > 0 &&
      chatLog.length == 0
    ) {
      setChatLog(inititalConversationLog);
    }
  }, [inititalConversationLog, chatLog]);

  useEffect(() => {
    setFormattedChatLog(chatLog);
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
          {formattedChatLog.map((c) => {
            return (
              <ConversationTurn
                key={c.id}
                c={c}
                showCOT={showCOT}
                agentName={agentName}
                allowFeedback={allowFeedback}
                selectedNode={selectedNode}
                onNodeSelect={() => {
                  setSelectedNode(c);
                }}
                onNodeDelete={async () => {
                  const matchingNodeIdx = chatLog.findIndex(
                    (node) => node.id == c.id
                  );
                  const updatedChatLog = chatLog.slice(0, matchingNodeIdx);
                  setChatLog(updatedChatLog);
                  pushConversationTurn(updatedChatLog, null);
                }}
                onNodeChange={async (updatedNode) => {
                  // find the node within the chatlog, update it, then trigger a new update sequence
                  const matchingNodeIdx = chatLog.findIndex(
                    (node) => node.id == updatedNode.id
                  );

                  const r = await parseMessageContents({
                    messageContents: {
                      role: updatedNode.role,
                      content: updatedNode.content,
                    },
                  });

                  chatLog[matchingNodeIdx] = r.data.parsedMessage;
                  const updatedChatLog = [...chatLog].slice(
                    0,
                    matchingNodeIdx + 1
                  );
                  setChatLog(updatedChatLog);
                  pushConversationTurn(updatedChatLog, null);
                }}
              ></ConversationTurn>
            );
          })}
        </Stack>
        <Box border="1px solid #333" borderRadius="5px" backgroundColor="white">
          {isQueryLoading && (
            <Box p="3" display="flex" flexDir="row" gap="10px">
              <Spinner></Spinner>
              <Text>The agent is thinking...</Text>
            </Box>
          )}

          {!selectedNode && (
            <InputGroup size="md">
              <Input
                isDisabled={isQueryLoading}
                variant="outline"
                placeholder={placeholder}
                value={userQuery}
                onKeyDown={async (event) => {
                  if (event.key === "Enter" && userQuery.length > 0) {
                    if (userQuery.startsWith("/feedback")) {
                      const feedback = userQuery.slice("/feedback".length + 1);
                      processUserFeedback(feedback);
                    } else {
                      pushConversationTurn(chatLog, userQuery);
                    }
                  }
                }}
                onChange={(event) => {
                  setUserQuery(event.target.value);
                }}
              />
            </InputGroup>
          )}

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
