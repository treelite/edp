/**
 * @file edp初始化
 * @author cxl(c.xinle@gmail.com)
 * @module lib/init
 */

var config = require('./config');

var questionList = [];

questionList.push({
    text: 'what\'s your name: ',
    callback: function (name) {
        config.set('username', name);
    }
});

questionList.push({
    text: 'what\'s your email: ',
    callback: function (email) {
        config.set('email', email);
    }
});

function ask(itr) {
    var question = questionList.shift();

    if (question) {
        itr.question(question.text, function (text) {
            question.callback(text);
            ask(itr);
        });
    }
    else {
        itr.close();
        console.log('finish');
    }
}

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令名称
 *
 * @type {string}
 */
cli.command = 'init';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '初始化edp';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp init';

/**
 * 命名入口
 */
cli.main = function () {
    var itr = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // 创建用户自定义模块目录
    /*
    var userModuleDir = require('./edp').getUserModuleDir();
    var fs = require('fs');
    if (fs.existsSync(userModuleDir)) {
        fs.mkdirSync(userModuleDir);
    }
    */

    ask(itr);
};

exports.cli = cli;
