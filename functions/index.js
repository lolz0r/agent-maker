const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { Configuration, OpenAIApi } = require("openai");

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
        continuation: parsedPromptResult,
      },
    });
  });
});
