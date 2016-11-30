'use strict';
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const chalk = require('chalk');
const npmRunPath = require('npm-run-path');

const TEN_MEGABYTES = 1000 * 1000 * 10;

module.exports = grunt => {
	grunt.registerMultiTask('shell', 'Run shell commands', function () {
		const cb = this.async();
		const opts = this.options({
			stdout: true,
			stderr: true,
			stdin: true,
			failOnError: true,
			stdinRawMode: false,
			preferLocal: true,
			spawn: false,
			execOptions: {
				env: null
			}
		});

		let cmd = typeof this.data === 'string' ? this.data : this.data.command;
		let args = this.data.args;
		args = typeof args === 'function' ? args.apply(grunt, arguments) : args;
		args = (typeof args === 'string' ? [args] : args) || [];
		for (var i = 0; i < args.length; ++i) {
			args[i] = grunt.template.process(args[i]);
		}

		if (cmd === undefined) {
			throw new Error('`command` required');
		}

		// increase max buffer
		opts.execOptions = Object.assign({}, opts.execOptions);
		opts.execOptions.maxBuffer = opts.execOptions.maxBuffer || TEN_MEGABYTES;

		cmd = grunt.template.process(typeof cmd === 'function' ? cmd.apply(grunt, arguments) : cmd);

		if (opts.preferLocal === true) {
			opts.execOptions.env = npmRunPath.env({env: opts.execOptions.env || process.env});
		}

		if (this.data.cwd) {
			opts.execOptions.cwd = this.data.cwd;
		}

		const cp = opts.spawn
		? spawn(cmd, args, opts.execOptions)
		: exec(cmd, opts.execOptions, (err, stdout, stderr) => {
			if (typeof opts.callback === 'function') {
				opts.callback.call(this, err, stdout, stderr, cb);
			} else {
				if (err && opts.failOnError) {
					grunt.warn(err);
				}
				cb();
			}
		});

		if (opts.spawn) {
			cp.on('close', (code, signal) => {
				if (typeof opts.callback === 'function') {
					opts.callback.call(this, code, signal, cb);
				} else {
					cb();
				}
			});

			cp.on('error', (err) => {
				if (opts.failOnError) {
					grunt.warn(err);
				}
				cb();
			});
		}

		const captureOutput = (child, output) => {
			if (typeof output === 'function') {
				child.on('data', data => {
					output.call(this, data);
				});
			} else if (grunt.option('color') === false) {
				child.on('data', data => {
					output.write(chalk.stripColor(data));
				});
			} else {
				child.pipe(output);
			}
		};

		grunt.verbose.writeln('Command:', chalk.yellow(cmd + ' ' + args.join(' ')));

		if (opts.stdout || grunt.option('verbose')) {
			captureOutput(cp.stdout, opts.stdout === true ? process.stdout : opts.stdout);
		}

		if (opts.stderr || grunt.option('verbose')) {
			captureOutput(cp.stderr, opts.stderr === true ? process.stderr : opts.stderr);
		}

		if (opts.stdin) {
			process.stdin.resume();
			process.stdin.setEncoding('utf8');

			if (opts.stdinRawMode && process.stdin.isTTY) {
				process.stdin.setRawMode(true);
			}

			process.stdin.pipe(cp.stdin);
		}
	});
};
