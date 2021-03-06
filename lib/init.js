const TelegramBot = require('node-telegram-bot-api');
const shared = require('./shared.js');

module.exports = function init(){
    return gladys.param.getValues(['TELEGRAM_API_KEY', 'TELEGRAM_WEBHOOK_URL'])
        .spread((telegramApiKey, webhookUrl) => {

            shared.telegramApiKey = telegramApiKey;

            if(webhookUrl === 'POLLING'){
                shared.bot = new TelegramBot(telegramApiKey, {polling: true, interval: 500});
            } else {
                shared.bot = new TelegramBot(telegramApiKey);
                shared.bot.setWebHook(webhookUrl);
            }

            shared.bot.on('message', msg => {
                sails.log.debug(`Telegram : Received message on chat ID = ${msg.chat.id}, from = "${msg.from.first_name} ${msg.from.last_name}" with content = "${msg.text}"`);

                gladys.param.getValue(`TELEGRAM_CHAT_ID_${msg.chat.id}_USER`)
                    .then((value) => {

                        // get the user
                        return gladys.user.getById({id: value});
                    })
                    .then((user) => {

                        // sending the message
                        return gladys.message.send(user, {text: msg.text});
                    })
                    .catch(() => {
                        sails.log.warn(`Telegram : Conversation not linked to a user in Gladys.`);
                        sails.log.warn(`Create a param in Gladys "TELEGRAM_CHAT_ID_${msg.chat.id}_USER" with in value the ID of your user in Gladys`);
                    });
            });

            shared.bot.on('webhook_error', (error) => {
                sails.log.warn(`Telegram : Webhook error : ${error}`);
            });

            shared.bot.on('polling_error', (error) => {
                sails.log.warn(`Telegram : Polling error : ${error}`);
            });
        })
};