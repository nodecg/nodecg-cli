'use strict';

var fs = require ('fs.extra');
var inquirer = require('inquirer');
var path = require('path');

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

module.exports = function bundleCommand(program) {
    program
        .command('init')
        .description('Create a new bundle template')
        .action(function() {
            inquirer.prompt(questions, function(answers) {
                var dir = path.resolve(process.cwd(), 'bundles', answers.name);
                fs.mkdirpSync(dir);
                fs.writeFileSync(path.join(dir, 'nodecg.json'), JSON.stringify(answers, null, 4));
            });
        });
};
