#### Installation

```shell
npm install --save @thebespokepixel/truwrap
```

#### CLI

```text
  truwrap
  Smarter terminal text wrapping (handles 24bit color)

  Synopsis:
    cat inputFile | truwrap [options]

  Options:
    -h, --help       Display this help.
    -v, --version    Return the current version on stdout. -vv Return name & version.
    -V, --verbose    Be verbose. -VV Be loquacious.
    -o, --stderr     Use stderr rather than stdout
    -l, --left       Left margin
    -r, --right      Right margin
    -w, --width      Set total width. Overrides terminal window’s width.
    -t, --truncate   Truncate panel cells.
    -m, --mode       Wrapping mode
    -s, --stamp      Print arguments rather than stdin. printf-style options supported.
    -p, --panel      Render a tabular panel into the available console width.
    -d, --delimiter  The column delimiter when reading data for a panel.
    -x, --regex      Character run selection regex.
    --color          Force color depth --color=256|16m. Disable with --no-color

  Usage:
  Reads unformatted text from stdin and typographically applies paragraph wrapping it for the currently active tty.
```

To use, simply pipe in a body of text to wrap according to the supplied options.

```shell
  cat readme.md | truwrap --left 6 --right 6 --mode soft
```

### Related

For advanced 24bit colour handling see [thebespokepixel/trucolor](https://github.com/thebespokepixel/trucolor) and [npm trucolor](https://www.npmjs.com/package/trucolor).
