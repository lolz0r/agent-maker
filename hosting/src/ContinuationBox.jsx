import { useState, useRef, useEffect } from "react";
import { Box, Input } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import ContentEditable from "react-contenteditable";

function ConinuationBox() {
  const [userPrompt, setUserPrompt] = useState("hello");
  const [continuation, setContinuation] = useState(" this is a continuation");
  const [context, setContext] = useState(0);

  const rawContentText = useRef("");
  useEffect(() => {
    rawContentText.current = `<span id="userPrompt">${userPrompt}</span><span id="continuation" style="background:#add8e6">${continuation}</span>`;
    setContext((c) => c + 1);
  }, [userPrompt, continuation]);

  return (
    <Box>
      <ContentEditable
        id={context}
        style={{
          width: "100%",
          border: "1px solid #aaa",
          margin: "10px",
          padding: "10px",
        }}
        html={rawContentText.current}
        onBlur={(e) => {
          console.log(e.target.innerHTML);
          setUserPrompt(e.target.outerText + "<br><br>whoa!");
          setContinuation("");
        }}
        onChange={(e) => {}}
      />
      U:{userPrompt}
      C:{continuation}
    </Box>
  );
}

export default ConinuationBox;
