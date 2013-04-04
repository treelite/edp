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
cli.description = '';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = '';

/**
 * 命令选项
 *
 * @type {Array.<string>}
 */
cli.options = [];


/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 * @param {Array} options 命令运行选项
 */
cli.main = function (args, options) {}

exports.cli = cli;
