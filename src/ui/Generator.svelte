<script lang="ts">
  /*
   * The generator: one Svelte component, hydrated on the start page.
   *   - The form on the left is a draft. "Write lyrics" writes an anthem from it; nothing is
   *     rewritten behind the person's back.
   *   - The sheet on the right is the anthem. In "Edit lines" every line can be typed over,
   *     written again or locked, with its syllable count beside it in words.
   *   - The anthem lives in its link (the words themselves, not a seed) and in the nation's
   *     profile file. Nothing is stored.
   *   - The phrase bank arrives as one file after the page; the pronunciation dictionary as
   *     another, read a piece at a time so that typing never waits for it.
   * Only tokens and eu- classes: no colour, font or spacing of its own.
   */
  import { faCheck, faCopy, faDownload, faFeather, faPen, faPlus, faPrint, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
  import { createProfile, getSection, setSection, type EurthProfile } from '@eurth/profile';
  import ProfileButtons from '@eurth/profile/ProfileButtons.svelte';
  import { calm, copyText, download, fileSlug, getPrefs, onPrefs, pictureFilename, resolveColors, stateLink, stateToLocation, svgToPicture, toast } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import ShareButtons from '@eurth/style/components/ShareButtons.svelte';
  import tokens from '@eurth/style/tokens.json';
  import { onMount, tick, untrack } from 'svelte';
  import type { Bank } from '../anthem/bank/types.ts';
  // The compiled phrase bank and the pronunciation table, each a file of its own beside the page.
  import bankUrl from '../anthem/generated/bank.json?url';
  import lexiconUrl from '../anthem/generated/lexicon.txt?url';
  import { MOOD_IDS } from '../anthem/bank/types.ts';
  import { describe, lyricsSheet, stanzaMetre, summary } from '../anthem/describe.ts';
  import { MAX_TITLE_LENGTH, checkAnthem, misfits, setLock, typeLine, typeTitle, type At } from '../anthem/edit.ts';
  import { MAX_VERSES, cleanSettings, generate, rerollLine, type Anthem, type Settings } from '../anthem/generate.ts';
  import { EMPTY_LEXICON, lexiconBuilder, type Lexicon } from '../anthem/lexicon.ts';
  import { toLinkState } from '../anthem/link.ts';
  import { METRES, METRE_IDS, SCHEME_IDS, rhymePartners, schemeFor } from '../anthem/metre.ts';
  import { anthemSection } from '../anthem/profile.ts';
  import { SHEET_SIZES, estimateWidth, sheetSvg, type Measure, type Palette } from '../anthem/sheet.ts';
  import { HIDDEN_THEMES, MOODS, type Theme } from '../anthem/themes.ts';
  import { wikitext } from '../anthem/wikitext.ts';
  import LineRow from './LineRow.svelte';
  import { MAX_SYLLABLES, addOwnTheme, fromParam, fromProfile, mainOf, mottoPlace, noteInWords, resultNotes, sayIt, singMotto, splitWords, stanzaName, stressFor, stressInWords, sungTimes, wordsToSay } from './page.ts';

  // Passed in by the page: browser code never imports eurth.config.mjs (see the note there).
  let {
    initial,
    themes,
    siteName,
    siteUrl,
    siteHost,
  }: {
    /** The anthem shown before anyone has touched anything, written when the site was built. */
    initial: { settings: Settings; anthem: Anthem };
    /** The themes the shipped bank has lines for. */
    themes: Theme[];
    siteName: string;
    siteUrl: string;
    siteHost: string;
  } = $props();

  const copyOf = (s: Settings): Settings => ({ ...s, themes: [...s.themes], include: [...s.include], own: { ...s.own } });

  // The draft in the form, and the settings the anthem on the sheet was written with.
  const start = untrack(() => initial);
  let form = $state<Settings>(copyOf(start.settings));
  let includeText = $state(start.settings.include.join(', '));
  let ownTheme = $state('');
  let written = $state.raw<Settings>(cleanSettings(start.settings));
  let anthem = $state.raw<Anthem>(start.anthem);
  let notes = $state.raw<string[]>([]);

  let ready = $state(false);
  // Once the person has made something, the address bar follows it.
  let touched = $state(false);
  let editing = $state(false);
  let busy = $state(false);
  let singing = $state(false);
  let sizeId = $state('portrait');
  let theme = $state<'light' | 'dark'>('dark');
  let profile = $state.raw<EurthProfile | null>(null);
  let motto = $state('');
  let lex = $state.raw<Lexicon>(EMPTY_LEXICON);
  let lexLoaded = $state(false);
  let sheet: HTMLElement | undefined = $state();

  let seed = 0;
  let bank: Promise<Bank | null> | null = null;
  let lexWait: Promise<Lexicon> | null = null;

  // ------------------------------------------------------------------------------ what is shown

  const scheme = $derived(schemeFor(written.metre, written.scheme));
  const whose = $derived(written.country === '' ? 'A national anthem' : `National anthem of ${written.country}`);
  const metreShown = $derived(written.metre === 'free' ? 'free verse' : METRES[written.metre].label);
  const dirty = $derived(JSON.stringify(cleanSettings(form)) !== JSON.stringify(written));
  const times = $derived(sungTimes(anthem));
  const checks = $derived(editing && lexLoaded ? checkAnthem(anthem, written, lex) : null);
  const said = $derived(lexLoaded ? wordsToSay(form, lex) : []);
  const hidden = $derived(HIDDEN_THEMES.filter((t) => form.themes.includes(t.id)));
  const available = $derived(new Set([...themes.map((t) => t.id), ...HIDDEN_THEMES.map((t) => t.id)]));
  const description = $derived(describe(anthem, written));
  // Before the page has loaded there is no address to read: the site's own, then.
  const link = $derived(stateLink(toLinkState(written, anthem), { base: ready ? location.href : `${siteUrl}/` }));
  const mottoAt = $derived(motto !== '' && lexLoaded && !anthem.stanzas.some((st) => st.lines.some((l) => l.text === motto)) ? mottoPlace(anthem, motto, lex, written) : null);

  const palette = $derived.by((): Palette => {
    const c = resolveColors(tokens, theme);
    return { paper: c.surface!, ink: c.ink!, muted: c['ink-muted']!, accent: c['accent-fill']! };
  });

  // What "Save profile" writes: the anthem section, and nothing else in the file touched.
  const saved = $derived.by(() => {
    const base = profile ?? (written.country === '' ? null : createProfile(written.country));
    if (!base) return null;
    // The file holds the anthem's address on the site itself, wherever this page is being tried.
    const home = stateLink(toLinkState(written, anthem), { base: `${siteUrl}/` });
    return setSection(base, 'anthem', anthemSection(anthem, written, home, getSection(base, 'anthem')) as never);
  });

  // ------------------------------------------------------------------- the bank and the dictionary

  function loadBank(): Promise<Bank | null> {
    bank ??= fetch(bankUrl)
      .then((r) => (r.ok ? (r.json() as Promise<Bank>) : null))
      .catch(() => null)
      .then((b) => {
        // A failed fetch may be tried again.
        if (!b) bank = null;
        return b;
      });
    return bank;
  }

  const pause = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

  /** Reads the dictionary a few thousand lines at a time, so the page never stops to do it. */
  async function readLexicon(text: string): Promise<Lexicon> {
    const lines = text.split('\n');
    const builder = lexiconBuilder();
    for (let at = 0; at < lines.length; at += 1500) {
      builder.add(lines.slice(at, at + 1500));
      await pause(0);
    }
    return builder.finish();
  }

  function loadLexicon(): Promise<Lexicon> {
    lexWait ??= fetch(lexiconUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('no dictionary'))))
      .then(readLexicon)
      .then((loaded) => {
        lex = loaded;
        lexLoaded = true;
        return loaded;
      })
      .catch(() => {
        lexWait = null;
        return EMPTY_LEXICON;
      });
    return lexWait;
  }

  // ---------------------------------------------------------------------------------- writing

  let measureWith: CanvasRenderingContext2D | null = null;
  const measure: Measure = (text, size, bold) => {
    if (!measureWith) return estimateWidth(text, size, bold);
    measureWith.font = `${bold ? 700 : 400} ${size}px system-ui, Arial, sans-serif`;
    return measureWith.measureText(text).width * 1.02;
  };

  /** The lines appear one by one, as if sung. Any key or click shows the rest at once. */
  async function sing() {
    singing = false;
    if (calm()) return;
    await tick();
    singing = true;
    const last = times[times.length - 1]?.[3] ?? 0;
    const mine = (singRun += 1);
    await pause(last + 700);
    if (mine === singRun) singing = false;
  }
  let singRun = 0;

  $effect(() => {
    if (!singing) return;
    const stop = () => (singing = false);
    window.addEventListener('keydown', stop);
    window.addEventListener('pointerdown', stop);
    return () => {
      window.removeEventListener('keydown', stop);
      window.removeEventListener('pointerdown', stop);
    };
  });

  async function write(saying = '') {
    if (busy) return;
    busy = true;
    const b = await loadBank();
    if (!b) {
      busy = false;
      toast('The phrase bank didn’t arrive. Check your connection and press Write lyrics again.');
      return;
    }
    // The person's own words scan best with the dictionary, but nobody waits long for it.
    const l = lexLoaded ? lex : await Promise.race([loadLexicon(), pause(400).then(() => lex)]);
    const next = cleanSettings(form);
    seed += 1;
    let result = generate(b, next, seed, { lexicon: l, keep: anthem });
    // The person's own words don't always find a line at the first go. An anthem takes a
    // moment to write, so write a few more and keep the one that seats the most of them.
    const lacking = (r: typeof result) => r.unplaced.length + (r.notes.some((n) => n.kind === 'short') ? 10 : 0);
    for (let n = 0; n < 30 && lacking(result) > 0; n += 1) {
      seed += 1;
      const other = generate(b, next, seed, { lexicon: l, keep: anthem });
      if (lacking(other) < lacking(result)) result = other;
    }
    const tell = resultNotes(result, next);
    if (lexLoaded) {
      const off = misfits(result.anthem, next, l).length;
      if (off > 0) tell.push(`${off === 1 ? 'One line you kept no longer fits' : `${off} lines you kept no longer fit`} the metre or the rhyme. ${off === 1 ? 'It is' : 'They are'} left as you wrote ${off === 1 ? 'it' : 'them'}: see Edit lines.`);
    }
    written = next;
    anthem = result.anthem;
    notes = tell;
    touched = true;
    busy = false;
    if (saying) toast(saying);
    // The form is long, and on a phone the sheet is below it: bring the new anthem into view.
    const top = sheet?.getBoundingClientRect().top ?? 0;
    if (sheet && (top < 0 || top > window.innerHeight * 0.6)) sheet.scrollIntoView({ block: 'start', behavior: calm() ? 'auto' : 'smooth' });
    void sing();
  }

  async function reroll(at: At) {
    const b = await loadBank();
    if (!b) return toast('The phrase bank didn’t arrive. Check your connection and try again.');
    seed += 1;
    const result = rerollLine(b, written, anthem, at, seed, { lexicon: lex });
    const only = result.notes.find((n) => n.kind === 'only');
    if (only) return toast(noteInWords(only, anthem, written));
    anthem = result.anthem;
    touched = true;
  }

  function type(at: At, text: string) {
    anthem = typeLine(anthem, at, text);
    touched = true;
  }

  function lock(at: At, locked: boolean) {
    anthem = setLock(anthem, at, locked);
    touched = true;
  }

  async function edit() {
    editing = !editing;
    singing = false;
    if (editing) await loadLexicon();
  }

  // ----------------------------------------------------------------------------------- the form

  function toggleTheme(id: string, on: boolean) {
    form.themes = on ? [...form.themes.filter((t) => t !== id), id] : form.themes.filter((t) => t !== id);
  }

  function addTheme() {
    const answer = addOwnTheme(ownTheme, form, available);
    if (answer.said === '') return;
    form = copyOf(answer.settings);
    includeText = form.include.join(', ');
    ownTheme = '';
    toast(answer.said);
  }

  // 8.7.8.7 can't be rhymed AABB: the choice is greyed out, and a draft that had it moves on.
  const noPairs = $derived(schemeFor(form.metre, 'AABB') !== 'AABB');
  $effect(() => {
    if (noPairs && form.scheme === 'AABB') form.scheme = 'ABAB';
  });

  function say(word: string, stress: string) {
    form = copyOf(sayIt(form, word, stress));
  }

  // -------------------------------------------------------------------------------- taking it away

  const copied = async (text: string, done: string) => toast((await copyText(text)) ? done : 'That didn’t copy. Your browser may not allow it here.');

  function sheetPicture(id: string) {
    const size = SHEET_SIZES.find((s) => s.id === id) ?? SHEET_SIZES[0]!;
    return { size, svg: sheetSvg(anthem, written, { size, palette, measure, footer: siteHost }) };
  }

  async function savePicture(kind: 'svg' | 'png' | 'webp') {
    const { size, svg } = sheetPicture(sizeId);
    const name = `${fileSlug(written.country, 'anthem')}-anthem-${size.id}`;
    if (kind === 'svg') return download(svg, `${name}.svg`, 'image/svg+xml');
    const asked = kind === 'png' ? 'image/png' : 'image/webp';
    const picture = await svgToPicture(svg, { width: size.width, height: size.height, type: asked });
    const file = pictureFilename(name, picture, asked);
    download(picture, file.filename);
    if (file.note) toast(file.note);
  }

  async function print() {
    editing = false;
    singing = false;
    await tick();
    window.print();
  }

  // ------------------------------------------------------------------------------------ arriving

  async function loaded(next: EurthProfile) {
    profile = next;
    // Words written elsewhere are counted with the dictionary, to find the metre they keep.
    const from = fromProfile(next, form, siteHost, await loadLexicon());
    const name = from.settings.country || next.meta.nation || 'Your nation';
    form = copyOf(from.settings);
    includeText = form.include.join(', ');
    motto = from.motto;
    if (from.anthem) {
      written = cleanSettings(from.settings);
      anthem = from.anthem;
      notes = [];
      touched = true;
      toast(`${name} is loaded, anthem and all.`);
    } else {
      await write(`${name} is loaded. Here is a first draft.`);
    }
  }

  async function useMotto() {
    if (!mottoAt) return;
    const at = mottoAt;
    anthem = singMotto(anthem, at, motto);
    touched = true;
    // The line it should rhyme with is written again to suit it, if it is free to change.
    const partner = rhymePartners(scheme)[at.line as 0 | 1 | 2 | 3] ?? -1;
    const other = anthem.stanzas[at.stanza]?.lines[partner];
    const b = await loadBank();
    if (b && other && !other.typed && !other.locked) {
      seed += 1;
      const result = rerollLine(b, written, anthem, { stanza: at.stanza, line: partner }, seed, { lexicon: lex });
      if (!result.notes.some((n) => n.kind === 'only')) anthem = result.anthem;
    }
    toast(`The motto is line ${at.line + 1} of ${stanzaName(anthem, at.stanza)} now, and locked.`);
  }

  onMount(() => {
    seed = Math.floor(Math.random() * 2 ** 30);
    measureWith = document.createElement('canvas').getContext('2d');

    const readTheme = () => {
      const chosen = getPrefs().theme;
      theme = chosen === 'light' || chosen === 'dark' ? chosen : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    readTheme();
    const stopPrefs = onPrefs(readTheme);

    // A link is someone else's input: fromParam never throws, and checks and clamps every value.
    const arrived = fromParam(new URLSearchParams(location.search).get('d'));
    if (arrived) {
      form = copyOf(arrived.settings);
      includeText = form.include.join(', ');
      if (arrived.anthem) {
        written = cleanSettings(arrived.settings);
        anthem = arrived.anthem;
        notes = [];
        touched = true;
      }
    }
    ready = true;
    void loadBank();
    if (arrived && !arrived.anthem) void write();
    // The dictionary is big: fetch it once the page has settled.
    const later = setTimeout(() => void loadLexicon(), 1500);
    return () => {
      stopPrefs();
      clearTimeout(later);
    };
  });

  // The address bar follows the anthem, so the link can be copied from there too.
  $effect(() => {
    const state = toLinkState(written, anthem);
    if (ready && touched) stateToLocation(state);
  });

  const where = (si: number, li: number) => `Line ${li + 1} of ${stanzaName(anthem, si)}`;
  const heading = (si: number) => {
    const name = stanzaName(anthem, si);
    return name === 'the chorus' ? 'Chorus' : name[0]!.toUpperCase() + name.slice(1);
  };
  const ownMetre = (si: number) => {
    const stanza = anthem.stanzas[si]!;
    return stanza.type === 'chorus' && written.metre !== 'free' && stanzaMetre(stanza) !== METRES[written.metre].label ? stanzaMetre(stanza) : '';
  };
</script>

<div class="generator">
  <form
    class="eu-card controls"
    aria-labelledby="settings-title"
    onsubmit={(e) => {
      e.preventDefault();
      void write();
    }}
  >
    <h2 id="settings-title" class="eu-visually-hidden">Settings</h2>

    <label class="eu-field">
      <span class="eu-label">Country</span>
      <input class="eu-input" bind:value={form.country} maxlength="80" autocomplete="off" placeholder="Your nation" />
    </label>

    <fieldset class="group">
      <legend class="eu-label">Themes</legend>
      <div class="eu-row">
        {#each [...themes, ...hidden] as t (t.id)}
          <label class="eu-pill">
            <input type="checkbox" checked={form.themes.includes(t.id)} onchange={(e) => toggleTheme(t.id, e.currentTarget.checked)} />
            <span class="eu-check"><Icon icon={faCheck} /></span>
            {t.label}
          </label>
        {/each}
      </div>
      <div class="own-theme">
        <label class="eu-field">
          <span class="eu-label">A theme of your own</span>
          <input
            class="eu-input"
            bind:value={ownTheme}
            maxlength="40"
            autocomplete="off"
            aria-describedby="own-theme-help"
            onkeydown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              addTheme();
            }}
          />
        </label>
        <button type="button" class="eu-btn" data-click="pop" onclick={addTheme}><Icon icon={faPlus} /> Add</button>
      </div>
      <p class="eu-help" id="own-theme-help">A theme with no lines of its own joins your words to include.</p>
    </fieldset>

    <div class="grid">
      <label class="eu-field">
        <span class="eu-label">Mood</span>
        <select class="eu-select" bind:value={form.mood}>
          {#each MOOD_IDS as id (id)}<option value={id}>{MOODS[id]}</option>{/each}
        </select>
      </label>
      <label class="eu-field">
        <span class="eu-label">Metre</span>
        <select class="eu-select" bind:value={form.metre}>
          {#each METRE_IDS as id (id)}<option value={id}>{id === 'free' ? 'Free verse' : `${METRES[id].label} (${id === '8787' ? 'hymn metre' : METRES[id].name})`}</option>{/each}
        </select>
      </label>
      <label class="eu-field">
        <span class="eu-label">Verses</span>
        <select class="eu-select" bind:value={form.verses}>
          {#each Array.from({ length: MAX_VERSES }, (_, i) => i + 1) as n (n)}<option value={n}>{n}</option>{/each}
        </select>
      </label>
      <label class="eu-field">
        <span class="eu-label">Rhyme</span>
        <select class="eu-select" bind:value={form.scheme} aria-describedby={noPairs ? 'rhyme-help' : undefined}>
          {#each SCHEME_IDS as id (id)}<option value={id} disabled={id === 'AABB' && noPairs}>{id}</option>{/each}
        </select>
      </label>
    </div>
    {#if noPairs}
      <p class="eu-help" id="rhyme-help">AABB is off for 8.7.8.7: its long lines end on a weak beat and its short lines on a strong one, and those never truly rhyme.</p>
    {/if}

    <label class="eu-pill chorus">
      <input type="checkbox" bind:checked={form.chorus} />
      <span class="eu-check"><Icon icon={faCheck} /></span>
      A chorus after the first verse
    </label>

    <label class="eu-field">
      <span class="eu-label">Words to include</span>
      <input class="eu-input" bind:value={includeText} oninput={() => (form.include = splitWords(includeText))} maxlength="400" autocomplete="off" aria-describedby="include-help" placeholder="harbour, tide, Selunna" />
      <span class="eu-help" id="include-help">Up to twelve, with commas between. A capital letter marks a place or a name: your capital, a river, a hero.</span>
    </label>

    {#if said.length > 0}
      <fieldset class="group">
        <legend class="eu-label">How do you say it?</legend>
        <p class="eu-help">These words aren’t in the dictionary, so their beat is a guess. Put it right and the anthem is written round your answer.</p>
        {#each said as word (word.key)}
          <div class="say">
            <p class="said"><strong>{word.text}</strong> <span class="eu-data">{word.spelled}</span> <span class="eu-muted">{stressInWords(word.stress)}{word.own ? ', as you said' : ''}</span></p>
            <label class="eu-field">
              <span class="eu-label">Syllables<span class="eu-visually-hidden"> in {word.text}</span></span>
              <select class="eu-select" value={word.stress.length} onchange={(e) => say(word.text, stressFor(Number(e.currentTarget.value), mainOf(word.stress)))}>
                {#each Array.from({ length: MAX_SYLLABLES }, (_, i) => i + 1) as n (n)}<option value={n}>{n}</option>{/each}
              </select>
            </label>
            <label class="eu-field">
              <span class="eu-label">Stress on<span class="eu-visually-hidden"> in {word.text}</span></span>
              <select class="eu-select" value={mainOf(word.stress) + 1} onchange={(e) => say(word.text, stressFor(word.stress.length, Number(e.currentTarget.value) - 1))}>
                {#each Array.from({ length: word.stress.length }, (_, i) => i + 1) as n (n)}<option value={n}>Syllable {n}</option>{/each}
              </select>
            </label>
          </div>
        {/each}
      </fieldset>
    {/if}

    <div class="eu-row">
      <button type="submit" class="eu-btn eu-btn--primary" data-click="bounce" aria-disabled={busy ? 'true' : undefined}><Icon icon={faFeather} /> Write lyrics</button>
    </div>
    <p class="eu-help" aria-live="polite">{dirty ? 'The settings have changed. Press Write lyrics to use them; lines you typed or locked are kept.' : 'Press it again for another anthem. Lines you typed or locked are kept.'}</p>
  </form>

  <section class="eu-card result" aria-labelledby="anthem-kicker" bind:this={sheet}>
    <div class="top">
      <h2 id="anthem-kicker" class="eu-kicker">Your anthem</h2>
      <span class="eu-muted">Original words, made in your browser</span>
    </div>

    <article class="sheet" class:singing aria-labelledby="anthem-title">
      <header class="sheet-head">
        {#if editing}
          <label class="eu-field">
            <span class="eu-label">Title</span>
            <input
              class="eu-input"
              value={anthem.title}
              maxlength={MAX_TITLE_LENGTH}
              autocomplete="off"
              aria-describedby="title-help"
              onchange={(e) => {
                anthem = typeTitle(anthem, e.currentTarget.value);
                touched = true;
              }}
            />
            <span class="eu-help" id="title-help">Leave it empty and the next Write lyrics gives it a title again.</span>
          </label>
          <h3 id="anthem-title" class="eu-visually-hidden">{anthem.title}</h3>
        {:else}
          <h3 id="anthem-title" class="title">{anthem.title}</h3>
        {/if}
        <p class="eu-muted sub">{whose} · {metreShown} · {scheme}</p>
      </header>

      {#each anthem.stanzas as stanza, si (si)}
        <section class="stanza" class:chorus={stanza.type === 'chorus'}>
          <h4 class="eu-kicker">{heading(si)}{ownMetre(si) ? ` · ${ownMetre(si)}` : ''}</h4>
          {#if editing}
            <ol class="rows">
              {#each stanza.lines as line, li (li)}
                <LineRow id="line-{si}-{li}" {line} where={where(si, li)} check={checks?.[si]?.[li] ?? null} ontype={(text) => type({ stanza: si, line: li }, text)} onlock={(locked) => lock({ stanza: si, line: li }, locked)} onreroll={() => reroll({ stanza: si, line: li })} />
              {/each}
            </ol>
          {:else}
            <p class="lines">
              {#each stanza.lines as line, li (li)}<span class="line" style:--at="{times[si]?.[li] ?? 0}ms">{line.text}</span>{/each}
            </p>
          {/if}
        </section>
      {/each}
      <p class="printed-by">Written with {siteName}, {siteHost}</p>
    </article>

    {#if notes.length > 0 || mottoAt}
      <ul class="notes">
        {#each notes as note (note)}
          <li><Icon icon={faTriangleExclamation} /> <span>{note}</span></li>
        {/each}
        {#if mottoAt}
          <li class="motto">
            <span>Your motto, “{motto}”, fits line {mottoAt.line + 1} of {stanzaName(anthem, mottoAt.stanza)}.</span>
            <button type="button" class="eu-btn" data-click="pop" onclick={useMotto}>Sing the motto</button>
          </li>
        {/if}
      </ul>
    {/if}

    <div class="eu-row actions">
      <button type="button" class="eu-btn eu-btn--primary" data-click="bounce" onclick={() => copied(lyricsSheet(anthem, written), 'Lyrics copied. Warm up your voice.')}><Icon icon={faCopy} /> Copy lyrics</button>
      <button type="button" class="eu-btn" aria-pressed={editing} data-click="pop" onclick={edit}><Icon icon={faPen} /> Edit lines</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={() => copied(wikitext(anthem, written), 'Wikitext copied: paste it into your nation’s page.')}><Icon icon={faCopy} /> Copy wikitext</button>
      <button type="button" class="eu-btn" data-click="bounce" onclick={print}><Icon icon={faPrint} /> Print</button>
    </div>

    <div class="pictures actions">
      <label class="eu-field">
        <span class="eu-label">Lyric sheet picture</span>
        <select class="eu-select" bind:value={sizeId}>
          {#each SHEET_SIZES as size (size.id)}<option value={size.id}>{size.label}, {size.width} × {size.height}</option>{/each}
        </select>
      </label>
      <div class="eu-row">
        <button type="button" class="eu-btn" data-click="bounce" onclick={() => savePicture('svg')}><Icon icon={faDownload} /> SVG</button>
        <button type="button" class="eu-btn" data-click="bounce" onclick={() => savePicture('png')}><Icon icon={faDownload} /> PNG</button>
        <button type="button" class="eu-btn" data-click="bounce" onclick={() => savePicture('webp')}><Icon icon={faDownload} /> WebP</button>
      </div>
    </div>

    <div class="actions share">
      <ShareButtons
        url={link}
        title={`“${anthem.title}”${written.country === '' ? '' : `, the anthem of ${written.country}`}`}
        text={`${summary(anthem, written)} Made with ${siteName}.`}
        description={() => description}
        picture={() => {
          const { size, svg } = sheetPicture('preview');
          return svgToPicture(svg, { width: size.width, height: size.height });
        }}
        heading={written.country === '' ? 'Share your anthem' : `Share the anthem of ${written.country}`}
        said={{ link: 'Link copied: every word is in it.', description: 'Description copied.', picture: 'Lyric sheet copied.' }}
      />
    </div>

    <div class="eu-row actions">
      <ProfileButtons profile={saved} onload={loaded} onerror={(errors) => toast(errors[0]?.message ?? 'That file isn’t a nation profile. Pick one that ends in .eurth.json.')} />
    </div>
    <p class="eu-help actions">
      The link holds every word. The profile file carries your nation from one Eurth tool to the next: load it to fill in the country, its capital and its cities{saved ? '' : '; name your country to save one'}. Nothing is kept in this browser.
    </p>
  </section>
</div>

<style>
  .generator {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
    gap: var(--space-6);
    align-items: start;
  }

  .controls {
    gap: var(--space-4);
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .own-theme,
  .pictures {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-3);
    align-items: end;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .chorus {
    justify-content: flex-start;
  }

  .say {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2) var(--space-3);
  }

  .said {
    grid-column: 1 / -1;
    margin: 0;
  }

  .result {
    gap: var(--space-4);
  }

  .top {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: baseline;
    justify-content: space-between;
  }

  .top h2 {
    margin: 0;
  }

  .sheet {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-6);
    border-radius: var(--radius-md);
    background: var(--surface);
  }

  .sheet-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .title {
    margin: 0;
    font: var(--type-title);
  }

  .sub {
    margin: 0;
  }

  .stanza {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .stanza h4 {
    margin: 0;
  }

  .lines {
    margin: 0;
    font: var(--type-lead);
  }

  .chorus .lines {
    font-weight: 700;
  }

  .line {
    display: block;
  }

  /* The signature touch: each line arrives in its turn, as if being sung. */
  .singing .line {
    animation: sung-in 0.4s ease-out both;
    animation-delay: var(--at);
  }

  @keyframes sung-in {
    from {
      opacity: 0;
      transform: translateY(var(--space-1));
    }
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .printed-by {
    display: none;
  }

  .notes {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--caution-text);
    font: var(--type-body-sm);
  }

  .notes li {
    display: flex;
    gap: var(--space-2);
    align-items: baseline;
  }

  .notes :global(svg) {
    flex: none;
    width: var(--space-3);
    height: var(--space-3);
  }

  .notes .motto {
    flex-wrap: wrap;
    align-items: center;
    color: var(--ink);
  }

  .share {
    padding-top: var(--space-4);
    border-top: 1px solid var(--line);
  }

  @media (max-width: 900px) {
    .generator {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  /* On a phone the cards give their room to the words. */
  @media (max-width: 480px) {
    .controls,
    .result {
      padding: var(--space-4);
    }

    .sheet {
      padding: var(--space-3);
    }
  }

  /* One sheet of A4 or Letter: the anthem and nothing else, dark ink on plain paper. */
  @media print {
    .controls,
    .top,
    .notes,
    .actions {
      display: none;
    }

    .generator {
      display: block;
    }

    .result,
    .sheet {
      padding: 0;
      background: none;
      color: var(--charcoal);
    }

    .sheet {
      gap: var(--space-4);
    }

    .sheet :global(.eu-kicker),
    .sub {
      color: var(--charcoal);
    }

    .stanza {
      break-inside: avoid;
    }

    .printed-by {
      display: block;
      margin: 0;
      font: var(--type-note);
    }
  }
</style>
