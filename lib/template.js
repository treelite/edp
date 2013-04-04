/**
 * @file 文件模板
 * @author cxl(c.xinle@gmail.com)
 * @module lib/template
 */

var path = require('path');
var pro = require('./project');

var DIR_TPL = 'template';

var dir = pro.findDir();

/**
 * 项目template目录
 *
 * @type {string}
 */
exports.PRO_DIR = dir ? pro.getConfigFile(dir, DIR_TPL) : '';

/**
 * 个人template目录
 *
 * @type {string}
 */
exports.HOME_DIR = require('./edp').getUserModuleDir() + '/' + DIR_TPL;


/**
 * 内建template目录
 *
 * @type {string}
 */
exports.BUILDIN_DIR = __dirname + '/' + DIR_TPL;

/**
 * template搜索路径
 *
 * @type {Array.<string>}
 */
exports.DIRS = [
    exports.PRO_DIR, exports.HOME_DIR, exports.BUILDIN_DIR
];

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
cli.description = '模板管理';

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
