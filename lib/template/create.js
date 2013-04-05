/**
 * @file 文件模板 创建文件
 * @author cxl(c.xinle@gmail.com)
 * @module lib/template/create
 */

var fs = require('fs');


/**
 * 处理模板文件内容
 * 替换附加信息
 *
 * @param {string} source 模板文件内容
 * @param {Object} info 附加信息
 * @return {string} 处理后的模板文件内容
 */
function parseSource(source, info) {
    info = info || {};

    var config = require('../config');
    info.author = config.get('username') || '';
    info.email = config.get('email') || '';

    source = source.replace(/#\{([^}]+)\}/g, function ($0, $1) {
        var item = info[$1];

        return item ? item : $0;
    });

    return source; 
}

/**
 * 拷贝模板文件
 *
 * @param {Object} tpl 模板对象
 * @param {string} name 文件名
 * @param {Object} options 文件附件信息
 */
function copyFile(tpl, name, options) {

    if (!name) {
        throw new Error('must have a name');
    }
    
    var info = {};
    info.desc = options.desc || '';
    info.filename = name;

    var source = fs.readFileSync(tpl.path, 'utf-8');

    source = parseSource(source, info);

    var suffix = tpl.suffix ? ('.' + tpl.suffix) : '';
    var file = process.cwd() 
        + '/' + name 
        + suffix;

    if (fs.existsSync(file)) {
        throw new Error(name + suffix + ' already exists');
    }
    else {
        fs.writeFileSync(file, source, 'utf-8');
    }
}

/**
 * 拷贝文件夹
 */
function copyDir() {
}

/**
 * 查找模板
 * 
 * @param {string} type 模板名
 * @param {string} dir 搜索目录
 * @return {string} 模板路径
 */
function findTpl(type, dir) {
    var path = require('path');
    if (!dir || !fs.existsSync(dir)) {
        return;
    }

    var res;
    fs.readdirSync(dir).forEach(function (file) {
        var file = path.resolve(dir, file);

        if (path.basename(file, '.tpl').split('.')[0] == type) {
            res = file;
        }
    });

    return res;
}

/**
 * 获取模板
 *
 * @param {string} type 模板名
 */
function getTpl(type) {
    var dirs = require('../template').DIRS;
    var tplPath;

    for (var i = 0, len = dirs.length; i < len; i++) {
        var dir = dirs[i];
        if (tplPath = findTpl(type, dir)) {
            break;
        }
    }

    if (!tplPath) {
        throw new Error('can not find template: ' + type);
    }

    var tpl = {path: tplPath};
    var stats = fs.statSync(tplPath);

    if (stats.isFile()) {
        tpl.type = 'file';
        tpl.suffix = require('path').basename(tplPath, '.tpl').split('.')[1];
    }

    return tpl;
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
cli.command = 'create';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '根据模板创建文件';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp template create [type] name [-d desc]';


/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 * @param {Array} options 命令运行选项
 */
cli.main = function (args, options) {
    var type;
    var name;

    if (args.length < 2) {
        type = 'js';
        name = args[0];
    }
    else {
        type = args[0];
        name = args[1];
    }

    var tpl = getTpl(type);

    if (tpl.type == 'file') {
        copyFile(tpl, name, options);
    }
    else {
        copyDir(tpl, options);
    }
};

exports.cli = cli;
