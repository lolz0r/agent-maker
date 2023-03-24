const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { Configuration, OpenAIApi } = require("openai");
const { readFile } = require("fs/promises");

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
      ],
      temperature: 0,
      stop: `<observation:user>`,
    });

    const parsedPromptResult = promptResult.data.choices[0];
    console.log(parsedPromptResult);

    res.json({
      status: "OK",
      data: {
        chatLog: [...updatedLog, parsedPromptResult.message],
      },
    });
  });
});
