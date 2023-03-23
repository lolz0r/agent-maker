import { useState, useRef, useEffect } from "react";
import { Box, Input, Spinner, IconButton } from "@chakra-ui/react";
import { GiBrainstorm } from "react-icons/gi";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./utils";
import { store } from "./utils";

import {
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $createTextNode,
  createEditor,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

function AgentEditor({}) {
  const firebaseApp = initializeApp(firebaseConfig);
  const analytics = getAnalytics(firebaseApp);
  const functions = getFunctions(firebaseApp);

  const theme = {
    // Theme styling goes here
    paragraph: "editor-paragraph",
  };
  // Catch any errors that occur during Lexical updates and log them
  // or throw them as needed. If you don't throw them, Lexical will
  // try to recover gracefully without losing user data.
  function onError(error) {
    console.error(error);
  }

  const config = {
    namespace: "AgentEditor",
    theme,
    onError,
  };
  function AgentDataPlugin() {
    const [editor] = useLexicalComposerContext();

    const [generatedAgentPrompt, setGeneratedAgentPrompt] = store.useState(
      "generatedAgentPrompt"
    );

    useEffect(() => {
      editor.update(() => {
        const root = $getRoot();

        // Get the selection from the EditorState
        const selection = $getSelection();

        // Create a new ParagraphNode
        const paragraphNode = $createParagraphNode();

        // Create a new TextNode
        const textNode = $createTextNode(generatedAgentPrompt);

        // Append the text node to the paragraph
        paragraphNode.append(textNode);

        // Finally, append the paragraph to the root
        root.append(paragraphNode);
      });
    }, [editor, generatedAgentPrompt]);
  }

  return (
    <Box h="100%">
      <LexicalComposer initialConfig={config}>
        <PlainTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={
            <div>Agent Definition will be initally provided by meta-agent</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              // Read the contents of the EditorState here.
              const root = $getRoot();
              const selection = $getSelection();

              console.log(root, selection);
            });
          }}
        />
        <HistoryPlugin />
        <AgentDataPlugin />
      </LexicalComposer>
    </Box>
  );
}

export default AgentEditor;
