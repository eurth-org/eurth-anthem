<script lang="ts">
  /*
   * One line of the anthem while it is being edited: a field to type over it, the syllable
   * count beside it as a number and a word (never colour alone), a button to write it again
   * and a lock.
   */
  import { faCheck, faDice, faLock, faLockOpen, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
  import Icon from '@eurth/style/components/Icon.svelte';
  import { MAX_LINE_LENGTH, describeCheck, type LineCheck } from '../anthem/edit.ts';
  import type { Line } from '../anthem/generate.ts';

  let {
    id,
    line,
    where,
    check,
    ontype,
    onlock,
    onreroll,
  }: {
    /** Unique on the page. */
    id: string;
    line: Line;
    /** "line 2 of verse 1" */
    where: string;
    /** Null until the dictionary has arrived. */
    check: LineCheck | null;
    ontype: (text: string) => void;
    onlock: (locked: boolean) => void;
    onreroll: () => void;
  } = $props();

  // While the field has the cursor it shows exactly what was typed, trailing space and all;
  // the anthem holds the tidied line.
  let draft = $state<string | null>(null);

  const good = $derived(check ? check.fits && check.rhyme !== 'no' : true);
  const words = $derived.by(() => {
    if (!check) return 'Counting the syllables…';
    let out = describeCheck(check);
    const partner = `line ${check.partner + 1}`;
    if (check.rhyme === 'yes') out += `. Rhymes with ${partner}`;
    else if (check.rhyme === 'no') out += `. Doesn’t rhyme with ${partner}`;
    else if (check.rhyme === 'unknown') out += `. The rhyme with ${partner} can’t be checked`;
    if (check.guessed.length > 0) out += `. The count of ${check.guessed.map((w) => `“${w}”`).join(' and ')} is a guess`;
    return `${out}.`;
  });
</script>

<li class="row">
  <label class="eu-visually-hidden" for={id}>{where}</label>
  <input
    {id}
    class="eu-input"
    value={draft ?? line.text}
    maxlength={MAX_LINE_LENGTH}
    autocomplete="off"
    spellcheck="true"
    aria-describedby="{id}-note"
    aria-invalid={good ? undefined : 'true'}
    oninput={(e) => {
      draft = e.currentTarget.value;
      ontype(draft);
    }}
    onblur={() => (draft = null)}
  />
  <button type="button" class="eu-btn eu-btn--icon" data-click="tumble" aria-label="Write {where} again" data-tip={line.locked ? 'Locked: unlock it to write it again' : 'Write this line again'} aria-disabled={line.locked ? 'true' : undefined} onclick={() => !line.locked && onreroll()}>
    <Icon icon={faDice} />
  </button>
  <button type="button" class="eu-btn eu-btn--icon" aria-pressed={line.locked} aria-label="Lock {where}" data-tip={line.locked ? 'Locked: kept as it is when you write again' : 'Lock this line'} onclick={() => onlock(!line.locked)}>
    <Icon icon={line.locked ? faLock : faLockOpen} />
  </button>
  <p class="note" class:off={!good} id="{id}-note" aria-live="polite">
    <Icon icon={good ? faCheck : faTriangleExclamation} />
    <span>{words}{line.typed ? ' Yours.' : ''}</span>
  </p>
</li>

<style>
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: var(--space-1) var(--space-2);
    align-items: center;
  }

  .note {
    display: flex;
    grid-column: 1 / -1;
    gap: var(--space-2);
    align-items: baseline;
    margin: 0;
    color: var(--success-text);
    font: var(--type-note);
  }

  .note.off {
    color: var(--caution-text);
  }

  .note :global(svg) {
    flex: none;
    width: var(--space-3);
    height: var(--space-3);
  }
</style>
