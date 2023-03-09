import { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  Spinner,
  IconButton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import ConinuationBox from "./ContinuationBox";

function ConinuationPrompt({ userQuery, aiPrimer, tooltip }) {
  return (
    <Box p="10px">
      <Tooltip label={tooltip}>
        <Text fontWeight={"bold"}>{userQuery}</Text>
      </Tooltip>
      <ConinuationBox primer={aiPrimer}></ConinuationBox>
    </Box>
  );
}

export default ConinuationPrompt;
