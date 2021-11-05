#! /usr/bin/env node
import { format } from 'node:util';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import getStdin from 'get-stdin';
import updateNotifier from 'update-notifier';
import { TemplateTag, replaceSubstitutionTransformer, stripIndent } from 'common-tags';
import { box } from '@thebespokepixel/string';
import { createConsole } from 'verbosity';
import { readPackageSync } from 'read-pkg';
import meta from '@thebespokepixel/meta';
import { createImage, truwrap, parsePanel } from 'truwrap';
import _ from 'lodash';
import { simple, palette } from 'trucolor';
import terminalFeatures from 'term-ng';

const clr = _.merge(
	simple({format: 'sgr'}),
	palette({format: 'sgr'},
		{
			title: 'bold #9994D1',
			bright: 'bold rgb(255,255,255)',
			dark: '#333',
		}),
);
const colorReplacer = new TemplateTag(
	replaceSubstitutionTransformer(
		/([a-zA-Z]+?)[:/|](.+)/,
		(match, colorName, content) => `${clr[colorName]}${content}${clr[colorName].out}`,
	),
);

const images = (function () {
	if (terminalFeatures.images) {
		return {
			space: '\t ',
			cc: createImage({
				name: 'logo',
				file: join(dirname(fileURLToPath(import.meta.url)), '/media/bytetree.png'),
				height: 3,
			}),
		}
	}
	return {
		space: '',
		cc: {
			render: () => '',
		},
	}
})();
async function help(yargsInstance) {
	const header = () => stripIndent(colorReplacer)`
		${`title|${metadata.name}`}
		${images.space}${metadata.description}
		${images.space}${`grey|${metadata.version(3)}`}
	`;
	const synopsis = stripIndent(colorReplacer)`
		${'title|Synopsis:'}
		${'command|cat'} ${'argument|inputFile'} ${'operator:|'} ${`command|${metadata.bin}`} ${'option|[options]'}
	`;
	const usage = stripIndent(colorReplacer)`
		${'title|Usage:'}
		Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.
	`;
	const epilogue = stripIndent(colorReplacer)`
		${`title|${metadata.name}`} ${`white|${metadata.copyright}`}. ${`grey|Released under the ${metadata.license} License.`}
		${'grey|An Open Source component from ByteTree.com\'s terminal visualisation toolkit'}
		${`grey|Issues?: ${metadata.bugs}`}
	`;
	const container = truwrap({
		mode: 'container',
		outStream: process.stderr,
	});
	const windowWidth = container.getWidth();
	const renderer = truwrap({
		left: 2,
		right: 0,
		outStream: process.stderr,
	});
	const usageContent = yargsInstance.wrap(renderer.getWidth()).getHelp();
	container.break();
	container.write(images.cc.render({
		nobreak: false,
		align: 2,
		spacing: ' ',
	}));
	container.write(header()).break();
	container.write(`${clr.dark}${'—'.repeat(windowWidth)}${clr.dark.out}`).break();
	renderer.write(synopsis).break(2);
	renderer.write(await usageContent).break(2);
	renderer.write(usage).break(2);
	container.write(`${clr.dark}${'—'.repeat(windowWidth)}${clr.dark.out}`);
	renderer.write(epilogue).end();
}

const console = createConsole({outStream: process.stderr});
const metadata = meta(dirname(fileURLToPath(import.meta.url)));
const pkg = readPackageSync();
const yargsInstance = yargs(hideBin(process.argv))
	.strictOptions()
	.help(false)
	.version(false)
	.options({
		h: {
			alias: 'help',
			describe: 'Display this help.'
		},
		v: {
			alias: 'version',
			count: true,
			describe: 'Return the current version on stdout. -vv Return name & version.'
		},
		V: {
			alias: 'verbose',
			count: true,
			describe: 'Be verbose. -VV Be loquacious.'
		},
		o: {
			alias: 'stderr',
			boolean: true,
			describe: 'Use stderr rather than stdout',
			default: false
		},
		l: {
			alias: 'left',
			describe: 'Left margin',
			requiresArg: true,
			default: 2
		},
		r: {
			alias: 'right',
			describe: 'Right margin',
			requiresArg: true,
			default: 2
		},
		w: {
			alias: 'width',
			describe: 'Set total width. Overrides terminal window’s width.',
			requiresArg: true,
			nargs: 1
		},
		t: {
			alias: 'tab',
			describe: 'Set tab width.',
			requiresArg: true,
			default: 2
		},
		m: {
			alias: 'mode',
			choices: ['hard', 'soft', 'keep', 'container'],
			describe: 'Wrapping mode',
			default: 'soft',
			requiresArg: true
		},
		s: {
			alias: 'stamp',
			boolean: true,
			describe: 'Print arguments rather than stdin. printf-style options supported.'
		},
		p: {
			alias: 'panel',
			boolean: true,
			describe: 'Render a tabular panel into the available console width.'
		},
		c: {
			alias: 'truncate',
			boolean: true,
			describe: 'Truncate panel cells.'
		},
		d: {
			alias: 'delimiter',
			describe: 'The column delimiter when reading data for a panel.',
			requiresArg: true,
			default: '|'
		},
		x: {
			alias: 'regex',
			describe: 'Character run selection regex.',
			requiresArg: true
		},
		color: {
			describe: 'Force color depth --color=256|16m. Disable with --no-color'
		}
	}).showHelpOnFail(false, `Use 'truwrap --help' for help.`);
const {argv} = yargsInstance;
const outStream = argv.stderr ? process.stderr : process.stdout;
if (argv.version) {
	process.stdout.write(`${metadata.version(argv.version)}\n`);
	process.exit(0);
}
if (argv.verbose) {
	const settings = {
		borderColor: 'green',
		margin: {
			bottom: 1,
			top: 1
		},
		padding: {
			bottom: 0,
			top: 0,
			left: 2,
			right: 2
		}
	};
	const titling = mode => stripIndent(colorReplacer)`
		${`title|${metadata.name}`}${`dim| │ v${metadata.version()}`}
		Mode: ${mode}
	`;
	switch (argv.verbose) {
		case 1:
			console.verbosity(4);
			console.log(box(titling('Verbose'), settings));
			break
		case 2:
			console.verbosity(5);
			console.log(box(titling('Some might say loquacious'), settings));
			console.yargs(argv);
			console.debug('');
			break
		default:
			console.verbosity(3);
	}
}
if (!(process.env.USER === 'root' && process.env.SUDO_USER !== process.env.USER)) {
	updateNotifier({pkg}).notify();
}
if (argv.help) {
	(async () => {
		await help(yargsInstance);
	})();
} else {
	const viewSettings = {
		left: argv.left,
		right: argv.right,
		mode: argv.mode,
		tabWidth: argv.tab,
		outStream
	};
	if (argv.regex) {
		viewSettings.tokenRegex = new RegExp(argv.regex, 'g');
	}
	if (argv.width) {
		viewSettings.width = argv.width;
	}
	const renderer = truwrap(viewSettings);
	if (argv.stamp) {
		renderer.write(format(...argv._));
	} else {
		getStdin().then(input => {
			if (argv.panel) {
				const panel = parsePanel(input, argv.delimiter, renderer.getWidth());
				renderer.panel(panel.content, {
					maxLineWidth: renderer.getWidth(),
					showHeaders: false,
					truncate: argv.truncate,
					config: panel.configuration
				});
			} else {
				renderer.write(input);
			}
		});
	}
}

export { console, metadata };
