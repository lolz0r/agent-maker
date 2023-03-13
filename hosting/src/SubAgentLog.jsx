import { useEffect, useState } from "react";

import {
  ChakraProvider,
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

export default function SubAgentLog(props) {
  const [showLog, setShowLog] = useState(false);
  return (
    <Box display="flex" placeContent="flex-end">
      <Button
        colorScheme="teal"
        size="xs"
        onClick={() => {
          setShowLog(!showLog);
        }}
      >
        Log
      </Button>
      {showLog && (
        <Box m="3">
          {props.log.map((l) => {
            return (
              <Text fontSize="8px" key={l.message}>
                {l.message}
              </Text>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
