#!/usr/bin/env node
'use strict';

// External libs
var inquirer = require('inquirer');
var fs = require ('fs.extra');

var questions = [
    {
        name: 'name',
        message: 'Bundle name:',
        validate: function(answer) {
            return answer ? true : false;
        }
    },
    {
        name: 'description',
        message: 'Description:'
    },
    {
        name: 'authors',
        message: 'Author:',
        filter: function(answer) {
            return new Array(answer);
        }
    },
    {
        name: 'homepage',
        message: 'Homepage:'
    },
    {
        name: 'license',
        message: 'License:'
    }
];
inquirer.prompt(questions, function(answers) {
    var dir = path.resolve(process.cwd(), 'bundles', answers.name);
    fs.mkdirpSync(dir);
    fs.writeFileSync(path.join(dir, 'nodecg.json'), JSON.stringify(answers, null, 4));
});