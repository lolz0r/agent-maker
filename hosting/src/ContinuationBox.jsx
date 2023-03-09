import { useState, useRef, useEffect } from "react";
import { Box, Input, Spinner, IconButton } from "@chakra-ui/react";
import { GiBrainstorm } from "react-icons/gi";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./utils";

import "./App.css";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import ContentEditable from "react-contenteditable";

function ConinuationBox({ primer }) {
  const firebaseApp = initializeApp(firebaseConfig);
  const analytics = getAnalytics(firebaseApp);
  const functions = getFunctions(firebaseApp);

  const refInputSpan = useRef(null);
  const refContinuationSpan = useRef(null);
  if (window.location.hostname == "localhost") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  const getContination = httpsCallable(functions, "getContination");

  const [isLoading, setIsLoading] = useState(false);

  function setPlaceholder() {
    if (refInputSpan.current.innerText.length == 0) {
      refInputSpan.current.innerHTML = `<i><span style="color:gray">${placeholder}</span></i>`;
    }
  }

  async function initiateAC() {
    setIsLoading(true);
    let prompt = refInputSpan.current.innerText;
    if (primer) {
      prompt = primer + "\n" + prompt;
    }

    //console.log(prompt)
    const res = await getContination({ prompt });

    // replace newlines with <br> for formatting purposes
    const reformattedText = refInputSpan.current.innerText.replace(
      /\n/g,
      "<br>"
    );
    refInputSpan.current.innerHTML =
      reformattedText +
      `<span id='continuaiton' style="animation: backgroundFade 3s;">${res.data.continuation}</span>`;

    setIsLoading(false);
  }
  return (
    <Box width="100%" display="flex" flexDir="column">
      <div
        contentEditable="plaintext-only"
        suppressContentEditableWarning={true}
        onInput={() => {}}
        ref={refInputSpan}
        style={{
          width: "100%",
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "5px",
        }}
      />

      <IconButton
        alignSelf="flex-end"
        size="sm"
        onClick={() => {
          initiateAC();
        }}
        mt="10px"
        isLoading={isLoading}
        aria-label="AI Complete"
        icon={<GiBrainstorm />}
      />
    </Box>
  );
}

export default ConinuationBox;
