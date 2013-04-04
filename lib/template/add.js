/**
 * @file 添加模块
 * @author cxl(c.xinle@gmail.com)
 * @module lib/template/add
 */

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
cli.command = 'add';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '添加模板\n只能添加项目或者个人级别的template';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp template add file [-g]';

/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 * @param {Array} options 命令运行选项
 */
cli.main = function (args, options) {
    var fs = require('fs');

    var file = args[0];

    if (!file) {
        throw new Error('miss filename');
    }

    if (!fs.existsSync(file)) {
        throw new Error('can not find ' + file);
    }

    var source = fs.readFileSync(file, 'utf-8');
    var name = require('path').basename(file) + '.tpl';

    var path;
    var template = require('../template');
    if (options.global) {
        path = template.HOME_DIR;
    }
    else if (template.PRO_DIR) {
       path = template.PRO_DIR; 
    }
    else {
        path = template.HOME_DIR;
    }

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    fs.writeFileSync(path + '/' + name, source, 'utf-8');
    
    console.log('add template to ' + path);
};

exports.cli = cli;
