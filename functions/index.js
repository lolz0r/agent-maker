const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { Configuration, OpenAIApi } = require("openai");
const { readFile } = require("fs/promises");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");
const { v4: uuidv4 } = require("uuid");

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
  console.log("about to parse", input);
  const doc = new DOMParser().parseFromString(input, "text/xml");
  const nodes = doc.childNodes[0].childNodes;

  const parsed = parseNodes(nodes);

  return parsed;
}

function parseMessageContents(messagesContents) {
  // parse clustered items and give each a unique id
  let renderedLog = [];
  const _ = messagesContents.forEach((turn) => {
    // parse the content of the turn

    const turnContents = parseData(`<data>${turn.content}</data>`);
    //console.log("****");
    console.log(turnContents);
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

  return renderedLog.map((turn) => {
    if (!turn.id) {
      turn.id = uuidv4();
    }
    return { ...turn };
  });
}

exports.parseMessageContents = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { messageContents } = req.body.data;
    const r = parseMessageContents([messageContents])[0];
    res.json({
      status: "OK",
      data: {
        parsedMessage: r,
      },
    });
  });
});

exports.runChatTurn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { chatLog, userReply, agentPrompt, openAIAPIKey } = req.body.data;

    const configuration = new Configuration({
      apiKey: openAIAPIKey,
    });
    const openai = new OpenAIApi(configuration);

    let promptText = "";
    if (agentPrompt != null) {
      promptText = agentPrompt;
    } else {
      promptText = await readFile("prompt-template.txt", "utf8");
    }

    let updatedLog = [...chatLog];
    if (userReply != null) {
      updatedLog.push({
        role: "user",
        content: `<observation:user>${userReply}</observation:user>`,
      });
    }

    let finalLog = null;
    while (true) {
      const promptResult = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        max_tokens: 2000,
        messages: [
          { role: "system", content: promptText },
          {
            role: "assistant",
            content:
              "<thought>I must always ensure that I wrap my thoughts and actions in the proper tags, like XML. Also, the user can only see messages sent via the 'Talk' tool.</thought>",
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
      let renderedLog = parseMessageContents([
        ...updatedLog,
        parsedPromptResult.message,
      ]);

      // determine if the last action is a 'talk' from the agent, if no insert a thought and try again
      const lastTurn = renderedLog[renderedLog.length - 1];
      console.log("last turn", lastTurn);

      if (
        lastTurn &&
        lastTurn.type &&
        lastTurn.type.toLowerCase() == "action" &&
        lastTurn.actionType &&
        lastTurn.actionType.toLowerCase() == "talk" &&
        lastTurn.role &&
        lastTurn.role.toLowerCase() == "assistant"
      ) {
        finalLog = renderedLog;
        break;
      } else {
        // append the updated log and try again
        // sometimes the LLM won't actually say anything - so we inject this thought and try again
        updatedLog = [
          ...renderedLog,
          {
            role: "assistant",
            type: "thought",
            content:
              "<thought>I must say something via the 'Talk' action</thought>",
          },
        ];
      }
    }

    res.json({
      status: "OK",
      data: {
        chatLog: finalLog,
      },
    });
  });
});

exports.runGPTCompletion = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { prompt, openAIAPIKey } = req.body.data;

    const configuration = new Configuration({
      apiKey: openAIAPIKey,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.0,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    const parsedPromptResult = response.data.choices[0];
    res.json({
      status: "OK",
      data: {
        response: parsedPromptResult,
      },
    });
  });
});
