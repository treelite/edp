/**
 * @file 文件模板
 * @author cxl(c.xinle@gmail.com)
 * @module lib/template
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
cli.command = 'template';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '项目/文件模板';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp template [type] name [-d desc]';

/**
 * 命令选项
 *
 * @type {Array.<string>}
 */
cli.options = ['desc:', 'global'];


/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 * @param {Array} options 命令运行选项
 */
cli.main = function (args, options) {
    var cmd = args[0];
    var defCmd = 'create';

    var modules = require('./cli').getSubModules('template');
    var module;
    
    modules.forEach(function (item) {
        if (item.cli.command == cmd) {
            module = item;
        }

        if (item.cli.command == defCmd) {
            defCmd = item;
        }
    });

    if (!module) {
        module = defCmd;
    }
    else {
        args.splice(0, 1);
    }

    module.cli.main(args, options);
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
