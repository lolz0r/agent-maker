import { useState, useRef, useEffect } from "react";
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

import SubAgentLog from "./SubAgentLog";

function ConversationTurn({ c, showCOT }) {
  if (c.type == "action" && c.actionType == "talk") {
    return (
      <Box
        key={JSON.stringify(c)}
        backgroundColor={"#c3ffb8"}
        alignSelf={"self-start"}
        p="3"
        w="90%"
        borderRadius="20px"
      >
        <Text fontSize="xs">Meta Agent</Text>
        <Text>{c.message}</Text>
      </Box>
    );
  }

  if (c.type == "observation" && c.from == "user") {
    return (
      <Box
        key={JSON.stringify(c)}
        backgroundColor={"#b8e0ff"}
        alignSelf={"self-end"}
        p="3"
        w="90%"
        borderRadius="20px"
      >
        <Text fontSize="xs">Human</Text>
        <Text>{c.message}</Text>
      </Box>
    );
  }
  if (showCOT) {
    if (c.type == "action" && c.actionType == "AddTool") {
      return (
        <Box
          key={JSON.stringify(c)}
          backgroundColor={"lightgray"}
          p="3"
          w="90%"
          borderRadius="20px"
        >
          <Text fontSize="xs">
            <b>Added Tool:</b> <i>{c.message}</i>
          </Text>
        </Box>
      );
    }
    if (c.type == "action" && c.actionType == "AddExampleConversation") {
      return (
        <Box
          key={JSON.stringify(c)}
          backgroundColor={"lightgray"}
          alignSelf={"self-start"}
          p="3"
          w="90%"
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
        <Box
          key={JSON.stringify(c)}
          backgroundColor={"lightgray"}
          p="3"
          w="90%"
          borderRadius="20px"
        >
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
            w="90%"
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
          <Box
            key={JSON.stringify(c)}
            backgroundColor={"lightgray"}
            p="3"
            w="90%"
            borderRadius="20px"
          >
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
        <Box
          key={JSON.stringify(c)}
          backgroundColor={"lightgray"}
          p="3"
          w="90%"
          borderRadius="20px"
        >
          <Text fontSize="xs">
            <b>Agent Thought:</b> <i>{c.message}</i>
          </Text>
        </Box>
      );
    }
  }
}

export default ConversationTurn;
