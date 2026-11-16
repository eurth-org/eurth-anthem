// Batch 10: choruses and titles. A chorus is the part everyone joins in, so these lines are
// about the singing itself, and they call the country by its name. Each is marked +chorus: it
// comes only in a chorus, and there it is favoured over an ordinary line. They have no theme, so
// every anthem can use them. The titles at the end are for any anthem too.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const chorus: BatchSource = {
  id: 'chorus',
  title: 'Choruses and titles',
  reviewed: false,

  classes: {},

  templates: [
    // ------------------------------------------------------------------ eight syllables, strong first
    // With the country's name, one for each shape a name can take.
    'call T8 | Sing, O {name.Sw}, sing for ever >land +chorus',
    'address T8 | {name.Sw}, hear thy people singing &thee >land +chorus',
    'address T8 | {name.Sw}, hear your people singing &you >land +chorus',
    'call T8 | Sing, {name.wSw}, sing for ever >land +chorus',
    'address T8 | {name.SwS}, our song and glory >land +chorus',
    'address T8 | {name.S}, our pride, our song, our glory >land +chorus',
    'address T8 | O {name.wS}, our song and glory >land +chorus',
    'address T8 | {name.SwSw}, hear us singing >land +chorus',

    'state T8 | Hearts and voices raised together +chorus',
    'state T8 | This our song and this our story +chorus',
    'state T8 | Loud and long we sing thy glory &thee +chorus',
    'state T8 | Loud and long we sing your glory &you +chorus',

    'call T8 | Sing it, sister, sing it, brother >people +chorus',
    'call T8 | Raise the chorus loud as thunder +chorus',
    'call T8 | Once again, and all together +chorus',

    'lead T8 | Voice to voice across the nation +chorus',
    'lead T8 | Clear as bells across the waters +chorus',

    // ------------------------------------------------------------------ seven syllables, strong first
    'call T7 | Sing for {name.Sw}, sing as one +chorus',
    'call T7 | Sing, {name.wSw}, sing as one >land +chorus',
    'close T7 | {name.Sw}, {name.Sw}, hear our song +chorus',
    'close T7 | {name.SwS}, we sing for thee &thee +chorus',
    'close T7 | {name.SwS}, we sing for you &you +chorus',
    'close T7 | {name.S}, our home for evermore +chorus',
    'close T7 | O {name.wS}, for evermore +chorus',
    'close T7 | {name.SwSw}, hear our song +chorus',
    'close T7 | O {name.wSwS}, we sing +chorus',
    'close T7 | {name.SwSwS}, we sing +chorus',

    'state T7 | This the song we love the best +chorus',
    'state T7 | Every voice takes up the song +chorus',

    'call T7 | Sing it loud and sing it clear +chorus',
    'call T7 | Let the chorus rise and ring +chorus',

    'lead T7 | With one voice and with one heart +chorus',
    'lead T7 | Loud and clear, from door to door +chorus',

    'cont T7 | And the chorus rings again +chorus',
    'cont T7 | While the echoes carry far +chorus',

    'contCall T7 | Till the rafters ring with song +chorus',
    'contCall T7 | With a glad and single voice +chorus',

    'close T7 | This our song, and this our vow +chorus',
    'close T7 | Sing it now and evermore +chorus',

    // ------------------------------------------------------------------ eight syllables, weak first
    'call I8 | Then sing, O {name.Sw}, sing as one >land +chorus',
    'call I8 | O sing, {name.wSw}, sing as one >land +chorus',
    'close I8 | {name.wSw}, hear thy people sing &thee +chorus',
    'close I8 | {name.wSw}, hear your people sing &you +chorus',
    'close I8 | O {name.SwS}, we sing for thee &thee +chorus',
    'close I8 | O {name.SwS}, we sing for you &you +chorus',
    'close I8 | O {name.S}, our home for evermore +chorus',
    'close I8 | {name.wS}, our home for evermore +chorus',
    'close I8 | O {name.SwSw}, hear our song +chorus',
    'close I8 | {name.wSwS}, we sing for thee &thee +chorus',
    'close I8 | {name.wSwS}, we sing for you &you +chorus',
    'close I8 | O {name.SwSwS}, we sing +chorus',

    'state I8 | A thousand voices sing as one +chorus',
    'state I8 | The song goes up from every door +chorus',

    'call I8 | Sing out, sing out, and sing again +chorus',
    'call I8 | Now all together, loud and clear +chorus',

    'lead I8 | With every voice in every town +chorus',
    'lead I8 | As loud as bells, as clear as day +chorus',

    'cont I8 | And every echo sings again +chorus',
    'cont I8 | And every heart takes up the song +chorus',

    'contCall I8 | Until the rafters ring with song +chorus',
    'contCall I8 | With all the voice that we can raise +chorus',

    'close I8 | This is our song, and this our vow +chorus',
    'close I8 | We sing it now and evermore +chorus',

    // ------------------------------------------------------------------ six syllables, weak first
    'close I6 | O {name.Sw}, hear our song +chorus',
    'close I6 | {name.wSw}, hear our song +chorus',
    'close I6 | For {name.SwS}, our home +chorus',
    'close I6 | O {name.S}, we sing for thee &thee +chorus',
    'close I6 | O {name.S}, we sing for you &you +chorus',
    'close I6 | {name.wS}, we sing for thee &thee +chorus',
    'close I6 | {name.wS}, we sing for you &you +chorus',
    'close I6 | O {name.SwSw}, sing +chorus',
    'close I6 | {name.wSwS}, we sing +chorus',
    'close I6 | O {name.SwSwS} +chorus',

    'state I6 | We sing with all our heart +chorus',
    'state I6 | The song is ours to sing +chorus',

    'call I6 | Sing out, and sing again +chorus',
    'call I6 | Now all together, sing +chorus',

    'cont I6 | And all the echoes ring +chorus',
    'cont I6 | With one united voice +chorus',

    'contCall I6 | Till every rafter rings +chorus',
    'contCall I6 | From every hill and town +chorus',

    'close I6 | Our song for evermore +chorus',
    'close I6 | We sing it, one and all +chorus',
  ],

  titles: [
    'Arise, {name}',
    'Hail, {name}',
    'Sing, {name}',
    'Hear Us, {name}',
    '{name}, Our Home',
    'Children of {name}',
    '{name}, {virtue.Sw} and {adj.S}',
    'Hearts and Voices',
    'One Land, One Heart',
    'Heart and Hand',
    'This Our Song',
    'We Stand Together',
    'From {ground.S} to {ground.S}',
  ],
};
