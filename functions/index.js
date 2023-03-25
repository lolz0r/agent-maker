const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { Configuration, OpenAIApi } = require("openai");
const { readFile } = require("fs/promises");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");
const { v4: uuidv4 } = require("uuid");

/*
const { createMetaAgent } = require("./agentFramework/metaAgent.js");
const { processUserTurn } = require("./agentFramework/agentProcessor.js");

exports.virtualMakerAgentTurn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { agentLog, userReply } = req.body.data;

    const agent = createMetaAgent();

    if (userReply == null || agentLog == null) {
      // no context provided, return early and give the user the initial context
      res.json({
        status: "OK",
        data: {
          agentLog: agent.cotPrompt,
        },
      });
      return;
    }

    let updatedLog = await processUserTurn({
      agent,
      agentLog,
      userReply,
    });

    res.json({
      status: "OK",
      data: {
        agentLog: updatedLog,
      },
    });
  });
});

exports.getContination = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { prompt } = req.body.data;

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const promptResult = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0,
      stop: `.`,
    });

    const parsedPromptResult = promptResult.data.choices[0].text;

    res.json({
      status: "OK",
      data: {
        continuation: parsedPromptResult + ".",
      },
    });
  });
});
*/

function parseNodes(nodes) {
  let parsed = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    console.log(node.nodeName);
    const [nodePrefix, nodeSuffix] = node.nodeName.split(":");
    ``;
    const content = node.toString();
    const message = node.textContent.trim();

    switch (nodePrefix) {
      case "thought":
        parsed.push({ type: nodePrefix, content, message });
        break;

      case "action":
        if (nodeSuffix == "AddExampleConversation") {
          const subConversation = parseNodes(node.childNodes);

          parsed.push({
            type: nodePrefix,
            actionType: nodeSuffix,
            content,
            message,
            subConversation,
            innerText: node.innerHTML,
          });
        } else {
          parsed.push({
            type: nodePrefix,
            actionType: nodeSuffix,
            content,
            message,
          });
        }

        break;

      case "observation":
        parsed.push({
          type: nodePrefix,
          observationSource: nodeSuffix,
          content,
          message,
        });
        break;
    }
  }
  return parsed;
}

function parseData(input) {
  //const dom = new JSDOM(input, { contentType: "text/xml" });
  const doc = new DOMParser().parseFromString(input, "text/xml");
  const nodes = doc.childNodes[0].childNodes;

  const parsed = parseNodes(nodes);

  return parsed;
}

exports.runChatTurn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { chatLog, userReply, agentPrompt } = req.body.data;

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    let promptText = "";
    if (agentPrompt != null) {
      promptText = agentPrompt;
    } else {
      promptText = await readFile("prompt-template.txt", "utf8");
    }

    const updatedLog = [
      ...chatLog,
      {
        role: "user",
        content: `<observation:user>${userReply}</observation:user>`,
      },
    ];

    const promptResult = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      max_tokens: 1000,
      messages: [
        { role: "system", content: promptText },
        {
          role: "assistant",
          content:
            "<thought>I must always ensure that I wrap my thoughts and actions in the proper tags, like XML</thought>",
        },
        ...updatedLog,
      ].map((turn) => {
        return { role: turn.role, content: turn.content };
      }),
      temperature: 0,
      stop: `<observation:user>`,
    });

    const parsedPromptResult = promptResult.data.choices[0];
    console.log("parsed prompt", parsedPromptResult);

    // parse clustered items and give each a unique id
    let renderedLog = [];
    const _ = [...updatedLog, parsedPromptResult.message].forEach((turn) => {
      // parse the content of the turn
      console.log("turn", turn);
      const turnContents = parseData(`<data>${turn.content}</data>`);
      //console.log("****");
      //console.log(turnContents);
      //console.log("****");

      turnContents.forEach((t) => {
        //console.log(t);
        if (t.type == "observation") {
          renderedLog.push({
            role: turn.role,
            type: t.type,
            from: t.observationSource,
            content: t.content,
            message: t.message,
          });
        }
        if (t.type == "action") {
          //console.log(t);
          renderedLog.push({
            role: turn.role,
            type: t.type,
            content: t.content,
            actionType: t.actionType,
            message: t.message,
          });
        }
        if (t.type == "thought") {
          renderedLog.push({
            role: turn.role,
            type: t.type,
            content: t.content,
            message: t.message,
          });
        }
      });
    });

    res.json({
      status: "OK",
      data: {
        chatLog: renderedLog.map((turn) => {
          if (!turn.id) {
            turn.id = uuidv4();
          }
          return { ...turn };
        }),
      },
    });
  });
});
