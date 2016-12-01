# grunt-shell [![Build Status](https://travis-ci.org/sindresorhus/grunt-shell.svg?branch=master)](https://travis-ci.org/sindresorhus/grunt-shell)

> Run shell commands

A good way to interact with other CLI tools. E.g. compiling Compass `compass compile` or get the current git branch `git branch`.

**Use [Stack Overflow](https://stackoverflow.com/questions/tagged/gruntjs) for support questions.**

---

<p align="center"><b>🔥 Want to strengthen your core JavaScript skills and master ES6?</b><br>I would personally recommend this awesome <a href="https://ES6.io/friend/AWESOME">ES6 course</a> by Wes Bos.</p>

---


## Install

```
$ npm install --save-dev grunt-shell
```


## Usage

```js
require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

grunt.initConfig({
	shell: {
		options: {
			stderr: false
		},
		target: {
			command: 'ls'
		},
		another: 'ls ./src' // shorthand
	}
});

grunt.registerTask('default', ['shell']);
```


## Examples

### Run command

Create a folder named `test`.

```js
grunt.initConfig({
	shell: {
		makeDir: {
			command: 'mkdir test'
		}
	}
});
```

The `command` property supports templates:

```js
grunt.initConfig({
	testDir: 'test',
	shell: {
		makeDir: {
			command: 'mkdir <%= testDir %>'
		}
	}
});
```

You can also supply a function that returns the command:

```js
grunt.initConfig({
	shell: {
		hello: {
			command: () => 'echo hello'
		}
	}
});
```

Which can also take arguments:

```js
module.exports = grunt => {
	grunt.loadNpmTasks('grunt-shell');
	grunt.initConfig({
		shell: {
			greet: {
				command: greeting => 'echo ' + greeting
			}
		}
	});
	grunt.registerTask('default', ['shell:greet:hello']);
}
```

### Run command and display the output

Output a directory listing in your Terminal.

```js
grunt.initConfig({
	shell: {
		dirListing: {
			command: 'ls'
		}
	}
});
```

### Custom callback

Do whatever you want with the output.

```js
function log(err, stdout, stderr, cb) {
	if (err) {
		cb(err);
		return;
	}

	console.log(stdout);
	cb();
}

grunt.initConfig({
	shell: {
		dirListing: {
			command: 'ls',
			options: {
				callback: log
			}
		}
	}
});
```

### Option passed to the .exec() method

Run a command in another directory. In this example we run it in a subfolder using the `cwd` (current working directory) option.

```js
grunt.initConfig({
	shell: {
		subfolderLs: {
			command: 'ls',
			options: {
				stderr: false,
				execOptions: {
					cwd: 'tasks'
				}
			}
		}
	}
});
```

### Multiple commands

Run multiple commands by placing them in an array which is joined using `&&` or `;`. `&&` means run this only if the previous command succeeded. You can also use `&` to have the commands run concurrently (by executing all commands except the last one in a subshell).

```js
grunt.initConfig({
	shell: {
		multiple: {
			command: [
				'mkdir test',
				'cd test',
				'ls'
			].join('&&')
		}
	}
});
```

### Spawn version

Use the spawn version if the command's output is big or you want to redirect the output to files.

```js
grunt.initConfig({
	shell: {
		app: {
			command: "mkdir",
			args: ["test"]
			options: {
				spawn: true,
				stdout: function (data) {
					console.log ("STDOUT: " + data);
				},
				stderr: function (data) {
					console.log ("STDERR: " + data);
				},
				callback: function (code, signal, cb) {
					console.log("Finished with " + code + " " + signal);
					cb();
				}
			}
		}
	}
});
```


## Config

### command

*Required*<br>
Type: `string` `Function`

Command to run or a function which returns the command. Supports underscore templates.

*If `spawn` is true, `command` should represent the command or the file path to be run, not including double quotes or arguments. User `arg` parameters for arguments instead.*

*Command can be omitted by directly setting the target with the command.*

### args

Type: `string` `Function` `array`

If it's a string it should be the only argument passed the executable. Use array for multiple arguments.

*Can only be used with `spawn: true`.*

### cwd

Type: `string`

Shortcut. Same as `options.execOptions.cwd` (see below).


## Options

### stdout

Type: `boolean` `Function` <br>
Default: `true`

Show stdout in the terminal if `true`.
If it's a function, it will call the function back with chunks of data as a parameter.

### stderr

Type: `boolean` `Function`<br>
Default: `true`

Show stderr in the terminal if `true`.
If it's a function, it will call the function back with chunks of data as a parameter.

Show stderr in the terminal.

### stdin

Type: `boolean`<br>
Default: `true`

Forward the terminal's stdin to the command.

### failOnError

Type: `boolean`<br>
Default: `true`

Fail task if it encounters an error. Doesn't apply if you specify a `callback`.

### stdinRawMode

Type: `boolean`<br>
Default: `false`

Set `stdin` to [act as a raw device](https://nodejs.org/api/tty.html#tty_readstream_setrawmode_mode).

### callback

Type: `Function`

If spawn is `false`, function has these parameters: (err, stdout, stderr, cb)
If spawn is `true`, function has these parameters: (code, signal, cb)

Lets you override the default callback with your own.

**Make sure to call the `cb` method when you're done.** Supply an error as the first argument to `cb` to print a warning and cause the task to fail.

### preferLocal

Type: `boolean`<br>
Default: `true`

Execute local binaries by name like [`$ npm run-script`](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/).

### spawn

Type: `boolean`<br>
Default: `false`

Use [`spawn`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) rather than [`exec`](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback).

### execOptions

Type: `Object`

Specify some options to be passed to the [.exec()](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) method, or [`.spawn()`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) method if `spawn` is set to `true`:

For `exec`:
- `cwd` string *Current working directory of the child process*
- `env` Object *Environment key-value pairs*
- `setsid` boolean
- `encoding` string *(Default: `'utf8'`)*
- `timeout` number *(Default: `0`)*
- `maxBuffer` number *(Default: `1000 * 1000 * 10` → 10 MB)*
- `killSignal` string *(Default: `'SIGTERM'`)*

For `spawn`:
- `cwd` string *Current working directory of the child process*
- `env` Object *Environment key-value pairs*
- `argv0` String *Explicitly set the value of argv[0] sent to the child process. This will be set to command if not specified.*
- `stdio` Array or String *Child's stdio configuration. (See [options.stdio](https://nodejs.org/api/child_process.html#child_process_options_stdio))*
- `detached` Boolean *Prepare child to run independently of its parent process. Specific behavior depends on the platform*
- `shell` Boolean or String * If true, runs command inside of a shell. Uses '/bin/sh' on UNIX, and 'cmd.exe' on Windows. A different shell can be specified as a string. The shell should understand the -c switch on UNIX, or /d /s /c on Windows. Defaults to false (no shell).*

## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
