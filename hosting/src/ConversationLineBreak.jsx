import { useState, useRef, useEffect } from "react";
import { Box, Input, Spinner, IconButton } from "@chakra-ui/react";
import { GiBrainstorm } from "react-icons/gi";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./utils";
import { store } from "./utils";

import "./App.css";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import ContentEditable from "react-contenteditable";

function ConversationLineBreak({ primer, dataKey }) {
  const firebaseApp = initializeApp(firebaseConfig);
  const analytics = getAnalytics(firebaseApp);
  const functions = getFunctions(firebaseApp);

  return <Box w="100%" h="5px" bg="gray"></Box>;
}

export default ConversationLineBreak;
