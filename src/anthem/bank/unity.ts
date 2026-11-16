// Batch 5: unity and the people. Words and lines for nations made of many: many tongues, many
// roads, one home. Tagged #unity, so they come only when that theme is chosen.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const unity: BatchSource = {
  id: 'unity',
  title: 'Unity and the people',
  reviewed: false,

  // More phrases for the core's groups.
  classes: {
    'kin.Sw': 'brothers #unity, sisters #unity',
  },

  templates: [
    'address T8 | Land of many tongues and peoples #unity >land',
    'address T8 | Land where many roads are meeting #unity >land',

    'state T8 | Many threads, a single weaving #unity',
    'state T8 | One in hoping, one in grieving #unity',
    'state T8 | Each a sister, each a brother #unity',
    'state T8 | North and south have come together #unity',
    'state T8 | Many voices, one in singing #unity',
    'state T8 | Old and young, we walk as neighbours #unity',

    'call T8 | Join your hands across the valleys #unity',
    'call T8 | Make a place for every stranger #unity',
    'call T8 | Break the bread and share the table #unity',
    'call T8 | Bind us closer, bind us stronger #unity',

    'lead T8 | Though our tongues and ways be many #unity',
    'lead T8 | Where the roads of all are meeting #unity',
    'lead T8 | Though the road be ever longer #unity',
    'lead T8 | Hand in hand and all together #unity',

    'address T7 | Land of many, land of one #unity >land',
    'address T7 | Home of many, hearth of all #unity >land',
    'address T7 | Land where every hand is kin #unity >land',

    'state T7 | Many tongues, a single song #unity',
    'state T7 | Different roads have led us here #unity',
    'state T7 | Every hand has work to share #unity',
    'state T7 | None shall stand or fall alone #unity',

    'call T7 | Take the stranger by the hand #unity',
    'call T7 | Weave the many into one #unity',
    'call T7 | Share the bread and share the song #unity',
    'call T7 | Let no wall divide the land #unity',

    'lead T7 | Side by side and hand in hand #unity',
    'lead T7 | Though our ways be far apart #unity',
    'lead T7 | Where the many roads are one #unity',

    'cont T7 | And the many speak as one #unity',
    'cont T7 | And no door is closed to kin #unity',
    'cont T7 | While we share a single sky #unity',
    'cont T7 | And the bond between us stays #unity',

    'contCall T7 | Till no heart is left alone #unity',
    'contCall T7 | For the neighbour at the door #unity',
    'contCall T7 | While we have a loaf to share #unity',

    'close T7 | Many hearts, a single home #unity',
    'close T7 | Each to each a helping hand #unity',
    'close T7 | All together, come what may #unity',
    'close T7 | None alone and none apart #unity',

    'address I8 | O land of many, land of one #unity >land',
    'address I8 | O home of many, hearth of all #unity >land',

    'state I8 | From many roads we came as one #unity',
    'state I8 | A hundred tongues, a single song #unity',
    'state I8 | We share one table and one sky #unity',
    'state I8 | No wall divides us, and no sea #unity',

    'call I8 | Join hands, join hands, and none alone #unity',
    'call I8 | Let every stranger find a friend #unity',
    'call I8 | Come one, come all, and join the song #unity',

    'lead I8 | Though many roads have brought us here #unity',
    'lead I8 | Whatever name our {elders.Sw} bore #unity',

    'cont I8 | And every hand has work to do #unity',
    'cont I8 | And none is stranger at the door #unity',

    'contCall I8 | Till every neighbour is a friend #unity',
    'contCall I8 | That none may ever stand alone #unity',

    'close I8 | A hundred hearths, a single home #unity',
    'close I8 | Together now, together still #unity',

    'state I6 | From many roads, one home #unity',
    'state I6 | One table and one sky #unity',
    'state I6 | No stranger at the door #unity',

    'call I6 | Join hands, and none alone #unity',
    'call I6 | Come share the bread and song #unity',

    'cont I6 | And many speak as one #unity',
    'cont I6 | And every hand is kin #unity',

    'contCall I6 | Till every door is wide #unity',
    'contCall I6 | For neighbour and for friend #unity',

    'close I6 | And none of us apart #unity',
    'close I6 | Together, come what may #unity',
    'close I6 | All one, and all at home #unity',
  ],

  titles: ['Many Hearts, One Home #unity', 'Hand in Hand #unity', 'A Hundred Hearths #unity'],
};
