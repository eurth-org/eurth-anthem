# The CMU Pronouncing Dictionary

`cmudict.dict`, `cmudict.phones` and `LICENSE` are an unchanged copy of commit `74790861f652b15e4ac49015a90074ad62a27690` (24 October 2025) of [github.com/cmusphinx/cmudict](https://github.com/cmusphinx/cmudict).

Copyright (C) 1993-2015 Carnegie Mellon University. The licence, a two-clause BSD licence, is in [LICENSE](LICENSE) and travels with every copy; Anthem's Glossary page carries the credit.

`tools/build-dict.mjs` checks the file's SHA-256 and turns it into the compact table Anthem loads, `src/anthem/generated/lexicon.txt`: each word's stress pattern and rhyme. To move to a newer copy, replace the files here and update the commit and the checksum in that tool together.
