/**
 * @class Bot
 * @classdesc The base class for Nestor. Initiates the Discord.js client and all other 
 * components (configuration, commands...).
 * 
 * @author HerrCraziDev <herrcrazi@gmail.com>
 */

const Discord = require('discord.js');
const CommandsHandler = require('./CommandsHandler');
const Configuration = require('./Configuration');
const { throws } = require('assert');


class Bot {
    config = {}
    token = ''
    name = ''
    version = ''

    client = {}


    constructor( token, config ) {
        this.config = new Configuration(config);
        this.version = this.config.bot.version;
        this.name = this.config.bot.name;
        
        if ( !token || typeof token != 'string' ) throw `${__filename} : No API token provided.`;
        else this.token = token;

        this.client = new Discord.Client({partials: ['CHANNEL', 'MESSAGE', 'REACTION']});
        this.commands = new CommandsHandler(this.client, this.config);
    }

    // TODO : move this into CommandHandler to allow multiple scoped command handlers
    parse(message) {
        if ( !message.author.bot && message.content.startsWith(this.config.bot.prefix) ) {
            console.log(`New message : ${message.content}`);

            let args = message.content.split(/ +/);
            let command = args[0].replace(this.config.bot.prefix, '');

            if ( this.commands.has(command) ) {
                this.commands[command].execute({ message }, ...args);
            } else {
                console.error(`Unknown command ${command} in message ${message.content}`);
                message.channel.send(`:x: **Unknown command \`${command}\`**\n*The Sage sat by the Old Yggdrasil, in a furtive gleam of sunlight, and shouted to the lost wanderer "Read the fucking manual, you fool!"*`);
            }
        }
    }
    
    // onStart() {}

    // onMessage() {}

    start() {
        console.log(`[${this.name}] Bot started with configuration :`);
        console.log(this.config.bot);

        this.client.once('ready', () => {
            console.log(`[${this.name}] Logged in as ${this.client.user.tag}`);
            this.client.user.setActivity("the world collapse", {type: 'WATCHING'});
        });

        this.client.on('message', message => this.parse(message));

        this.client.login(this.token);
    }
};

module.exports = Bot;