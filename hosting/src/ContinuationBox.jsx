import { useState, useRef, useEffect } from "react";
import { Box, Input } from "@chakra-ui/react";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./utils";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import ContentEditable from "react-contenteditable";

function ConinuationBox(props) {
  const firebaseApp = initializeApp(firebaseConfig);
  const analytics = getAnalytics(firebaseApp);
  const functions = getFunctions(firebaseApp);

  const refInputSpan = useRef(null)
  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  const getContination = httpsCallable(functions, "getContination");

  const [userPrompt, setUserPrompt] = useState("hello");
  const [continuation, setContinuation] = useState("");

  useEffect(() => {
    refInputSpan.current.innerText = userPrompt
  }, [userPrompt, continuation]);

  return (
    <Box >
      <span
        contentEditable
        suppressContentEditableWarning={true}

        onBlur={async (e)=>{
          console.log(refInputSpan.current.innerText)
          const res = await getContination({prompt:refInputSpan.current.innerText})
          refInputSpan.current.innerText = refInputSpan.current.innerText + continuation

          setContinuation(res.data.continuation)
        }}
        ref={refInputSpan}
        style={{
      
        }}
        
      />
      <span style={{background:"#add8e6"}}>{continuation}</span>
 
    </Box>
  );
}

export default ConinuationBox;
