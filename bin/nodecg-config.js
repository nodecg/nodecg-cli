#!/usr/bin/env node
'use strict';

// Nodejs libs
var fs = require('fs');
var path = require('path');

// External libs
var inquirer = require('inquirer');

if (fs.existsSync(path.join(process.cwd(), 'cfg/nodecg.json'))) {
    console.warn('cfg/nodecg.json already exists, exiting');
    process.exit(0);
}

var questions = [
    {
        name: 'host',
        message: 'Hostname',
        default: 'localhost'
    },
    {
        name: 'port',
        message: 'Port',
        default: 9090,
        filter: function(answer) {
            return parseInt(answer);
        }
    },
    {
        name: 'console.enabled',
        message: 'Enable console logging?',
        type: 'confirm'
    },
    {
        name: 'console.level',
        message: 'Console logging level',
        type: 'list',
        default: 'debug',
        choices: [
            'trace',
            'debug',
            'info',
            'warn',
            'error'
        ],
        when: function(answers) {
            return answers['console.enabled'];
        }
    },
    {
        name: 'file.enabled',
        message: 'Enable file logging?',
        type: 'confirm'
    },
    {
        name: 'file.level',
        message: 'Console logging level',
        type: 'list',
        default: 'info',
        choices: [
            'trace',
            'debug',
            'info',
            'warn',
            'error'
        ],
        when: function(answers) {
            return answers['file.enabled'];
        }
    }
];

inquirer.prompt(questions, function(answers) {
    var cfg = {
        host: answers.host,
        port: answers.port,
        logging: {
            console: {
                enabled: answers['console.enabled'],
                level: answers['console.level']
            },
            file: {
                enabled: answers['file.enabled'],
                path: 'logs/server.log',
                level: answers['file.level']
            }
        }
    };
    var dir = path.resolve(process.cwd(), 'cfg');
    fs.mkdirpSync(dir);
    console.log(dir);
    fs.writeFileSync(path.join(dir, 'nodecg.json'), JSON.stringify(cfg, null, 4));
});