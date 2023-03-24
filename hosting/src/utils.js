export const firebaseConfig = {
  apiKey: "AIzaSyAa2bpyRoKuUviZlCVf3zMgdCm5JRt9HqQ",
  authDomain: "agent-maker.firebaseapp.com",
  projectId: "agent-maker",
  storageBucket: "agent-maker.appspot.com",
  messagingSenderId: "800988891549",
  appId: "1:800988891549:web:52204fb1368fc4a21b4774",
  measurementId: "G-XS1XE9TZHZ",
};

import { createStore } from "state-pool";
export const store = createStore(); // Create store for storing our global state

function parseNodes(nodes) {
  let parsed = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const [nodePrefix, nodeSuffix] = node.nodeName.split(":");

    const content = node.textContent.trim();

    switch (nodePrefix) {
      case "thought":
        parsed.push({ type: nodePrefix, content });
        break;

      case "action":
        if (nodeSuffix == "AddExampleConversation") {
          const subConversation = parseNodes(node.children);

          parsed.push({
            type: nodePrefix,
            actionType: nodeSuffix,
            content,
            subConversation,
            innerText: node.innerHTML,
          });
        } else {
          parsed.push({ type: nodePrefix, actionType: nodeSuffix, content });
        }

        break;

      case "observation":
        parsed.push({
          type: nodePrefix,
          observationSource: nodeSuffix,
          content,
        });
        break;
    }
  }
  return parsed;
}

export function parseData(input) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(input, "text/xml");
  const nodes = xml.documentElement.childNodes;

  const parsed = parseNodes(nodes);

  return parsed;
}
