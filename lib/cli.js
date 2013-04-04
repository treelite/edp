/**
 * @file 命令行功能模块
 * @author errorrik[errorrik@gmail.com]
 * @module lib/cli
 */

/**
 * 获取具有命令行功能的模块列表
 * 
 * @inner
 * @param {string} baseDir 基础目录
 * @return {Array}
 */
function getModules( baseDir ) {
    var fs = require( 'fs' );
    var path = require( 'path' );
    var commandModules = [];

    fs.readdirSync( baseDir ).forEach( 
        function ( file ) {
            file = path.resolve( baseDir, file );
            if ( fs.statSync( file ).isFile() 
                 && path.extname( file ).toLowerCase() === '.js'
            ) {
                var module = require( file );
                if ( module.cli ) {
                    commandModules.push( module );
                }
            }
        }
    );

    return commandModules;
}

/**
 * 获取内建模块列表
 * 
 * @return {Array}
 */
exports.getBuiltinModules = function () {
    return getModules( __dirname );
};

/**
 * 获取用户定义模块列表
 * 
 * @return {Array}
 */
exports.getUserModules = function () {
    return getModules( require( './edp' ).getUserModuleDir() );
};

/**
 * 显示默认命令行信息
 * 
 * @inner
 */
function defaultInfo() {
    var moduleNames = [];
    function readName( mod ) {
        moduleNames.push( mod.cli.command );
    }

    console.log( 'Usage: edp <command> [<args>]\n' );

    console.log( 'Builtin Commands:' );
    exports.getBuiltinModules().forEach( readName );
    console.log( moduleNames.join( ', ' ) );
    console.log();

    console.log( 'User Commands:' );
    moduleNames = [];
    exports.getUserModules().forEach( readName );
    console.log( moduleNames.join( ', ' ) );
    console.log();

    console.log( 'See "edp help <command>" for more information.' );
}


/**
 * 命令模块索引
 * 
 * @inner
 * @type {Object}
 */
var commandIndex = {};

/**
 * 扫瞄目录，用于建立命令模块索引
 * 
 * @param {string} dir 目录路径名
 * @param {string=} commandPath 命令路径
 */
function scanDir( dir, commandPath ) {
    commandPath = commandPath || [];
    var fs = require( 'fs' );
    var path = require( 'path' );

    if (!fs.existsSync(dir)) {
        return;
    }

    fs.readdirSync( dir ).forEach( 
        function ( file ) {
            var fullPath = path.resolve( dir, file );
            var stat = fs.statSync( fullPath );
            var extName = path.extname( file );
            var name = path.basename( file, extName );

            if ( stat.isFile() && /^\.js$/i.test( extName ) ) {
                var module = require( fullPath );
                if ( module.cli ) {
                    var cmdPath = commandPath.slice( 0 );
                    cmdPath.push( name ); 
                    commandIndex[ cmdPath.join( '/' ) ] = module;
                }
            }
            else if ( stat.isDirectory() ) {
                var cp = commandPath.slice( 0 );
                cp.push( name );
                scanDir( fullPath, cp );
            }
        }
    );
}

// create module index
scanDir( __dirname );
scanDir( require( './edp' ).getUserModuleDir() );

/**
 * 解析选项信息。选项信息格式示例：
 * 
 * + `h`: -h
 * + `help`: -h 或 --help
 * + `output:`: -o xxx 或 --output xxx 或 --output=xxx
 * 
 * @inner
 * @param {string|Object} option 选项信息
 * @return {Object}
 */
function parseOption( option ) {
    if ( typeof option === 'string' ) {
        if ( /^([-a-z0-9]+)(:)?$/i.test( option ) ) {
            var name = RegExp.$1;
            option = {};
            option.requireValue = !!RegExp.$2;
            if ( name.length > 1 ) {
                option.name = name.charAt( 0 );
                option.fullname = name;
            }
            else {
                option.name = name;
            }
        }
        else {
            throw new Error( 'Option string is invalid: ' + option );
        }
    }

    return option;
}

/**
 * 获取模块
 * 
 * @param {string} command 命令名称
 * @return {Object}
 */
exports.getModule = function ( command ) {
    return commandIndex[ command ] || null;
};

/**
 * 获取子模块列表
 * 
 * @param {string} command 命令名称
 * @return {Array}
 */
exports.getSubModules = function ( command ) {
    var startKey = command + '/';
    var modules = [];
    Object.keys( commandIndex ).forEach(
        function ( key ) {
            if ( key.indexOf( startKey ) === 0 ) {
                modules.push( commandIndex[ key ] );
            }
        }
    );

    return modules;
};

/**
 * 解析参数。作为命令行执行的入口
 * 
 * @param {Array} args 参数列表
 */
exports.parse = function ( args ) {
    args = args.slice( 2 );

    // 无参数时显示默认信息
    if ( args.length === 0 ) {
        defaultInfo();
        return;
    }

    // 查找命令模块
    var commandName = args.shift();
    while ( args.length ) {
        var nextName = commandName + '/' + args[ 0 ];

        if ( commandIndex[ nextName ] ) {
            commandName = nextName;
            args.shift();
        }
        else {
            break;
        }
    }

    // 无命令模块时直接错误提示并退出
    var commandModule = commandIndex[ commandName ];
    if ( !commandModule ) {
        console.log( 'Error command' );
        return;
    }

    // 解析参数
    var commandArgs = [];
    var commandOptions = {};
    while ( args.length ) {
        var seg = args.shift();

        if ( /^-(-)?([A-Z0-9]+)(=[^=]+)?$/i.test( seg ) ) {
            var optionInfo = {};
            optionInfo[ RegExp.$1 ? 'fullname' : 'name' ] = RegExp.$2;
            optionInfo.value = RegExp.$3;

            var moduleOptions = commandModule.cli.options || [];
            for ( var i = 0; i < moduleOptions.length; i++ ) {
                var opt = parseOption( moduleOptions[ i ] );
                if ( opt.fullname === optionInfo.fullname
                     || opt.name === optionInfo.name
                ) {
                    var value = true;
                    if ( opt.requireValue ) {
                        value = optionInfo.value || args.shift();
                    }

                    commandOptions[ opt.fullname ] = value;
                    break;
                }
            }
        }
        else {
            commandArgs.push( seg );
        }
    }
    
    // 运行命令
    commandModule.cli.main( commandArgs, commandOptions );
};
