// Batch 4: freedom and revolution. Words and lines for nations that won their liberty, and for
// nations the people made. The freedom lines are tagged #freedom and the revolution lines
// #revolution, so each comes only when its theme is chosen.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const freedom: BatchSource = {
  id: 'freedom',
  title: 'Freedom and revolution',
  reviewed: false,

  // More phrases for the core's groups.
  classes: {
    'gift.Sw': 'birthright #freedom',
    'ground.S': 'street #revolution, square #revolution',
    'grounds.S': 'streets #revolution, squares #revolution',
    'kin.Sw': 'comrades #revolution, workers #revolution',
  },

  templates: [
    // ================================================================== freedom
    'address T8 | Land of freedom, land of justice #freedom >land',
    'address T8 | Land that broke the chains of ages #freedom >land',
    'address T8 | Land of free and equal people #freedom >land',

    'state T8 | None shall bind us, none shall break us #freedom',
    'state T8 | Free we are, and none shall take us #freedom',
    'state T8 | We have cast away the fetters #freedom',
    'state T8 | Here no head is bowed to any #freedom',
    'state T8 | High the torch of hope is blazing #freedom',
    'state T8 | Every voice is ours for raising #freedom',
    'state T8 | Every chain is burst asunder #freedom',
    'state T8 | Free the word that we have spoken #freedom',
    'state T8 | Open stands the door of morning #freedom',

    'call T8 | Write it large on all our pages #freedom',
    'call T8 | Write the law in golden letters #freedom',
    'call T8 | Break the chain and lift the fallen #freedom',
    'call T8 | Keep the door of freedom open #freedom',
    'call T8 | Speak the truth and fear no master #freedom',

    'lead T8 | Now that every chain is broken #freedom',
    'lead T8 | Where no tyrant casts a shadow #freedom',
    'lead T8 | Since the night of chains is over #freedom',
    'lead T8 | Under skies as wide as freedom #freedom',

    'address T7 | Land where every soul is free #freedom >land',
    'address T7 | Land that bows to none but right #freedom >land',
    'address T7 | Home of free and equal hands #freedom >land',
    'address T7 | Land that cast away the chain #freedom >land',

    'state T7 | Free we stand and free remain #freedom',
    'state T7 | None shall bind us, none shall break #freedom',
    'state T7 | We are free as wind and light #freedom',
    'state T7 | Here no chain shall bind the mind #freedom',
    'state T7 | Every voice may speak its part #freedom',
    'state T7 | We were born beneath no yoke #freedom',
    'state T7 | Long ago the fetters broke #freedom',

    'call T7 | Keep the flame of freedom bright #freedom',
    'call T7 | Let the song of freedom rise #freedom',
    'call T7 | Hold the freedom we have won #freedom',
    'call T7 | Leave the weary years behind #freedom',

    'lead T7 | Now the chains are cast away #freedom',
    'lead T7 | Where the free have made their home #freedom',
    'lead T7 | Since the day the fetters fell #freedom',

    'cont T7 | And the fetters fall away #freedom',
    'cont T7 | And no tyrant holds the key #freedom',
    'cont T7 | For the right is ours to hold #freedom',
    'cont T7 | And our children live to tell #freedom',

    'contCall T7 | Till the last of chains shall fall #freedom',
    'contCall T7 | For the freedom of us all #freedom',
    'contCall T7 | While a single heart is bound #freedom',

    'close T7 | Free in thought and word and deed #freedom',
    'close T7 | Free we live, or not at all #freedom',
    'close T7 | Never more to wear a chain #freedom',
    'close T7 | Freedom first and freedom last #freedom',

    'address I8 | O land where every soul is free #freedom >land',
    'address I8 | O home of free and equal hands #freedom >land',

    'state I8 | We bow to none, we stand as one #freedom',
    'state I8 | The chains are gone, the gates are wide #freedom',
    'state I8 | Our {elders.Sw} fought, and we are free #freedom',
    'state I8 | The right to speak, the right to be #freedom',
    'state I8 | We walk in freedom, heads held high #freedom',

    'call I8 | Hold fast the freedom we have won #freedom',
    'call I8 | Let none be bound and none afraid #freedom',
    'call I8 | Go free, go free, and fear no chain #freedom',

    'lead I8 | As free as wind upon the hill #freedom',
    'lead I8 | Because our {elders.Sw} broke the chain #freedom',
    'lead I8 | Wherever freedom finds a home #freedom',
    'lead I8 | As long as any heart is bound #freedom',

    'cont I8 | And none shall take the right away #freedom',
    'cont I8 | And every door stands open wide #freedom',

    'contCall I8 | Till none is bound and all are free #freedom',
    'contCall I8 | For those who have not found a voice #freedom',

    'close I8 | And none shall ever make us kneel #freedom',
    'close I8 | And free we live, or not at all #freedom',

    'state I6 | No hand shall make us kneel #freedom',
    'state I6 | The chains are cast away #freedom',
    'state I6 | We bow to none but right #freedom',
    'state I6 | Our hearts and hands are free #freedom',
    'state I6 | We keep our given word #freedom',

    'call I6 | Go free and fear no chain #freedom',
    'call I6 | Stand tall, and stand as one #freedom',
    'call I6 | Hold fast what we have won #freedom',

    'cont I6 | And none shall bar the way #freedom',
    'cont I6 | And every voice is heard #freedom',
    'cont I6 | Beneath an open sky #freedom',

    'contCall I6 | Till every heart is free #freedom',
    'contCall I6 | For freedom and for all #freedom',

    'close I6 | In freedom we rejoice #freedom',
    'close I6 | And free we shall remain #freedom',
    'close I6 | No more to wear a chain #freedom',
    'close I6 | For ever and for all #freedom',

    // ================================================================== revolution
    'address T8 | Land the many hands have founded #revolution >land',
    'state T8 | Yesterday we rose together #revolution',
    'state T8 | Old the wrong, and new the morning #revolution',
    'state T8 | In the streets the bells are ringing #revolution',
    'state T8 | Hand to hand we built tomorrow #revolution',
    'call T8 | Raise the banner high together #revolution',
    'call T8 | March as one to meet the morning #revolution',
    'lead T8 | When the people rose like thunder #revolution',
    'lead T8 | From the streets and from the workshops #revolution',

    'address T7 | Land the people made their own #revolution >land',
    'address T7 | Born of struggle, raised in pride #revolution >land',
    'state T7 | We arose and we remain #revolution',
    'state T7 | Many hands have made the day #revolution',
    'state T7 | Yesterday we broke the night #revolution',
    'call T7 | March together, heart and hand #revolution',
    'call T7 | Build the world we fought to win #revolution',
    'lead T7 | Since the day the people rose #revolution',
    'lead T7 | When the old world passed away #revolution',
    'cont T7 | And the morning was our own #revolution',
    'cont T7 | And the banner still is high #revolution',
    'contCall T7 | Till the work we swore is done #revolution',
    'contCall T7 | For the ones who fell that day #revolution',
    'close T7 | What we won we mean to keep #revolution',
    'close T7 | Forward, comrades, hand in hand #revolution',

    'address I8 | O land the people made their own #revolution >land',
    'state I8 | We rose as one, and here we stand #revolution',
    'state I8 | The night is past, the day is won #revolution',
    'call I8 | March on, march on, the day is near #revolution',
    'call I8 | Remember those who lit the flame #revolution',
    'lead I8 | Because the people would not kneel #revolution',
    'lead I8 | When all the people rose as one #revolution',
    'cont I8 | And none shall turn us from the way #revolution',
    'contCall I8 | Until the work we swore is done #revolution',
    'close I8 | The world we build shall be our own #revolution',
    'close I8 | And what we won we mean to keep #revolution',

    'state I6 | The people hold the day #revolution',
    'state I6 | We rose, and here we stand #revolution',
    'call I6 | March on, and never yield #revolution',
    'cont I6 | And banners fill the sky #revolution',
    'cont I6 | And morning was our own #revolution',
    'contCall I6 | Till all the work is done #revolution',
    'contCall I6 | For those who lit the flame #revolution',
    'close I6 | And what we won, we keep #revolution',
    'close I6 | Together, hand in hand #revolution',
  ],

  titles: [
    'Free We Stand #freedom',
    'The Broken Chain #freedom',
    'No Chain Shall Bind #freedom',
    'Morning of the People #revolution',
    'Hand to Hand #revolution',
  ],
};
