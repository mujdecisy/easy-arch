#!/usr/bin/env node

const { init, exportPdf, exportHtml, watch } = require('./easy-architect');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const packageJson = require('./package.json');

yargs(hideBin(process.argv))
  .command('init', 'Initialize a new Markdown file', {}, async () => {
    await init();
  })
  .command('exportPDF', 'Export markdown as PDF', {
    input: {
      alias: 'i',
      type: 'string',
      description: 'Input Markdown file',
      demandOption: true,
      coerce: (arg) => {
        if (path.extname(arg) !== '.md') {
          throw new Error('Input file must be a Markdown (.md) file');
        }
        return arg;
      }
    }
  }, async (argv) => {
    await exportPdf(argv.input);
  })
  .command('exportHTML', 'Export markdown as html', {
    input: {
      alias: 'i',
      type: 'string',
      description: 'Input Markdown file',
      demandOption: true,
      coerce: (arg) => {
        if (path.extname(arg) !== '.md') {
          throw new Error('Input file must be a Markdown (.md) file');
        }
        return arg;
      }
    }
  }, async (argv) => {
    await exportHtml(argv.input);
  })
  .command('watch', 'Watch a file for changes', {
    input: {
      alias: 'i',
      type: 'string',
      description: 'Input Markdown file',
      demandOption: true,
      coerce: (arg) => {
        if (path.extname(arg) !== '.md') {
          throw new Error('Input file must be a Markdown (.md) file');
        }
        return arg;
      }
    }
  }, async (argv) => {
    await watch(argv.input);
  })
  .command('version', 'Show the version of the application', {}, () => {
    console.log(`Version: ${packageJson.version}`);
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .fail((msg, err, yargs) => {
    if (err) {
      console.error(err.message);
    } else {
      console.error(msg);
    }
    console.error('Use --help to see available commands.');
    process.exit(1);
  })
  .help()
  .argv;
