import { useState, useRef, useEffect } from "react";
import {
  Button,
  Stack,
  Text,
  Textarea,
  Box,
  Grid,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
  Switch,
  Tooltip,
} from "@chakra-ui/react";

import { MdFeedback } from "react-icons/md";

import SubAgentLog from "./SubAgentLog";
import {
  DeleteIcon,
  CheckIcon,
  SmallCloseIcon,
  CloseIcon,
} from "@chakra-ui/icons";

function ConversationTurn({
  c,
  showCOT,
  agentName,
  allowFeedback,
  onNodeSelect,
  onNodeChange,
  onNodeDelete,
  selectedNode,
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isNodeSelected, setIsNodeSelected] = useState(false);
  const [activeSelectedNodeContents, setActiveSelectedNodeContents] =
    useState("");
  function renderTurnContents() {
    if (c.type == "action" && c.actionType.toLowerCase() == "talk") {
      const showHover = allowFeedback && isHovering;
      const showSelectedNode = selectedNode && selectedNode.id == c.id;

      return (
        <Box
          backgroundColor={"#c3ffb8"}
          alignSelf={"self-start"}
          p="3"
          borderRadius="20px"
          cursor={allowFeedback && isHovering ? "pointer" : ""}
          style={{
            border: showSelectedNode
              ? "3px solid red"
              : showHover
              ? "1px solid #777"
              : "1px solid transparent",
          }}
        >
          <Text fontSize="xs">{agentName}</Text>
          <Box display="flex" flexDir="row">
            <Text>{c.message}</Text>
          </Box>
        </Box>
      );
    }

    if (c.type == "observation" && c.from == "user") {
      return (
        <Box backgroundColor={"#b8e0ff"} ml="40px" p="3" borderRadius="20px">
          <Text fontSize="xs">Human</Text>
          <Text>{c.message}</Text>
        </Box>
      );
    }
    if (showCOT) {
      if (c.type == "action" && c.actionType == "AddTool") {
        return (
          <Box backgroundColor={"lightgray"} p="3" borderRadius="20px">
            <Text fontSize="xs">
              <b>Added Tool:</b> <i>{c.message}</i>
            </Text>
          </Box>
        );
      }
      if (c.type == "action" && c.actionType == "AddExampleConversation") {
        return (
          <Box
            backgroundColor={"lightgray"}
            alignSelf={"self-start"}
            p="3"
            borderRadius="20px"
          >
            <Text fontSize="xs">
              <b>Agent Action:</b>{" "}
              <i>{c.actionType} ... (see generated agent parameters)</i>
            </Text>
          </Box>
        );
      }
      if (c.type == "observation" && c.from != "user") {
        return (
          <Box backgroundColor={"lightgray"} p="3" borderRadius="20px">
            <Text fontSize="xs">
              <b>Agent Observation:</b>{" "}
              <i>
                from tool {c.from} ... "{c.message}"
              </i>
            </Text>
            {c.subAgentLog && <SubAgentLog log={c.subAgentLog}></SubAgentLog>}
          </Box>
        );
      }
      if (c.type == "action") {
        if (c.question) {
          return (
            <Box
              key={JSON.stringify(c)}
              backgroundColor={"lightgray"}
              p="3"
              borderRadius="20px"
            >
              <Text fontSize="xs">
                <b>Agent Action:</b>{" "}
                <i>
                  {c.actionType} ... "{c.question}"
                </i>
              </Text>
            </Box>
          );
        } else {
          return (
            <Box backgroundColor={"lightgray"} p="3" borderRadius="20px">
              <Text fontSize="xs">
                <b>Agent Action:</b>{" "}
                <i>
                  {c.actionType} ... {c.message}
                </i>
              </Text>
            </Box>
          );
        }
      }

      if (c.type == "thought") {
        return (
          <Box backgroundColor={"lightgray"} p="3" borderRadius="20px">
            <Text fontSize="xs">
              <b>Agent Thought:</b> <i>{c.message}</i>
            </Text>
          </Box>
        );
      }
    }
  }

  return (
    <Box
      pr="10px"
      cursor="pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => {
        /*
        if (allowFeedback) {
          onNodeSelect(c);
        }
        */
        if (!isNodeSelected) {
          setIsNodeSelected(true);
          setActiveSelectedNodeContents(c.content);
        }
      }}
    >
      {!isNodeSelected && renderTurnContents()}
      {isNodeSelected && (
        <Box p="3" outline="2px solid orange">
          <Textarea
            value={activeSelectedNodeContents}
            onChange={(e) => {
              setActiveSelectedNodeContents(e.target.value);
            }}
          ></Textarea>
          <Box
            display="flex"
            flexDir="row"
            gap="10px"
            alignContent="flex-end"
            mt="10px"
          >
            <Tooltip label="Commit change and regenerate chat">
              <IconButton
                size="xs"
                onClick={() => {
                  onNodeChange({ ...c, content: activeSelectedNodeContents });
                  setIsNodeSelected(false);
                }}
                icon={<CheckIcon />}
              ></IconButton>
            </Tooltip>
            <Tooltip label="Delete turn and regenerate chat">
              <IconButton
                size="xs"
                icon={<DeleteIcon />}
                onClick={() => {
                  onNodeDelete(c);
                  setIsNodeSelected(false);
                }}
              ></IconButton>
            </Tooltip>
            <Tooltip label="Cancel change">
              <IconButton
                size="xs"
                icon={<CloseIcon />}
                onClick={(e) => {
                  setIsNodeSelected(false);
                  e.preventDefault();
                }}
              ></IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default ConversationTurn;
