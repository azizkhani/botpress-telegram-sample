/*
  CONGRATULATIONS on creating your first Botpress bot!

  This is the programmatic entry point of your bot.
  Your bot's logic resides here.
  
  Here's the next steps for you:
  1. Read this file to understand how this simple bot works
  2. Read the `content.yml` file to understand how messages are sent
  3. Install a connector module (Facebook Messenger and/or Slack)
  4. Customize your bot!

  Happy bot building!

  The Botpress Team
  ----
  Getting Started (Youtube Video): https://www.youtube.com/watch?v=HTpUmDz9kRY
  Documentation: https://botpress.io/docs
  Our Slack Community: https://slack.botpress.io
*/

const DEFAULT_ANSWERS = event => [
  event.user.first_name + ", choose something from the menu below but please don't say words to me :)",
  "Help, words are not my strong point " + event.user.first_name,
  "Motivational videos are all I understand unfortunately",
  "I like you.  You say words to me that sound nice even if I don't understand them :s",
  "I hope you see how easy it is to create a bot on botpress " + event.user.first_name + ", clearly I'm in need of some nlp functionality though!"
]
module.exports = function(bp) {
  // Listens for a first message (this is a Regex)
  // GET_STARTED is the first message you get on Facebook Messenger
  bp.hear(/GET_STARTED|hello|hi|test|hey|holla/i, (event, next) => {
    event.reply('#welcome') // See the file `content.yml` to see the block
  })

  

  // You can also pass a matcher object to better filter events
  bp.hear({
    type: /message|text/i,
    text: /exit|bye|goodbye|quit|done|leave|stop/i
  }, (event, next) => {
    event.reply('#goodbye', {
      // You can pass data to the UMM bloc!
      reason: 'unknown'
    })
  })

  bp.hear({
    type: /message|text/i,
    text: /list|ali/i,
  }, (event, next) => {
    bp.telegram.sendText(event.chat.id, "انتخاب کنید",{
      reply_markup: {
          keyboard: [
              ["💪سفارش", "💪محصولات"],   
              ["💪درباره ما"] 
          ]
      }
    });
    bp.telegram.sendText(event.chat.id, "انتخاب کنید",{
      reply_markup: {
          inline_keyboard	: [
              [{
                text: 'تست دکمه داخلی',
                callback_data: 'test'
              }]
            ]
      }
    });
  })

  bp.botDefaultResponse = event => {
    const text = _.sample(DEFAULT_ANSWERS(event));
    return bp.telegram.sendText(event.chat.id, text);
  }
}
