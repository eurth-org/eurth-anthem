// Batch 6: faith. Words and lines for nations that pray: thanks, blessing, bells and lamps.
// Tagged #faith, so they come only when that theme is chosen. The lines marked >god speak to
// Heaven and not to the land; a stanza that prays uses those, and the land's own addresses stay
// out of it. The wording keeps to what most faiths share (Heaven, the Maker, grace, prayer), so
// it suits a made-up religion as well as a familiar one.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const faith: BatchSource = {
  id: 'faith',
  title: 'Faith',
  reviewed: false,

  // More phrases for the core's groups.
  classes: {
    'gift.S': 'grace #faith, prayer #faith',
    'gift.Sw': 'blessing #faith',
    'ground.S': 'shrine #faith',
    'ground.Sw': 'temple #faith, altar #faith',
    'grounds.S': 'shrines #faith',
    'grounds.Sw': 'temples #faith, altars #faith',
    'landadj.Sw': 'holy #faith, sacred #faith, hallowed #faith',
    'kin.Sw': 'pilgrims #faith',
  },

  templates: [
    // ------------------------------------------------------------------ eight syllables, strong first
    'address T8 | Maker of the {grounds.S} and {grounds.Sw} #faith >god',
    'address T8 | Giver of the rain and {dawn.Sw} #faith >god',
    'address T8 | Thou who made the {grounds.S} and {grounds.Sw} &thee #faith >god',
    'address T8 | You who made the {grounds.S} and {grounds.Sw} &you #faith >god',
    'address T8 | Heaven, hear a people praying #faith >god',

    'state T8 | In the dawn the bells are ringing #faith',
    'state T8 | Grace has kept us through the weather #faith',
    'state T8 | Heaven\'s lamp is ever burning #faith',
    'state T8 | Morning finds the faithful praying #faith',
    'state T8 | Every field thy hand is tending &thee #faith',
    'state T8 | Every field your hand is tending &you #faith',
    'state T8 | Faith has brought us all together #faith',
    'state T8 | Every {ground.S} and {ground.S} is holy #faith',
    'state T8 | High and humble, great and lowly #faith',
    'state T8 | Prayers like morning mist ascending #faith',
    'state T8 | Thanks we bring for all the living #faith',

    'call T8 | Guide us on through {trial.S} and {trial.Sw} #faith >god',
    'call T8 | Light the road and walk beside us #faith >god',
    'call T8 | Grant us grace and grant us {gift.Sw} #faith >god',
    'call T8 | Bless, we pray, this {dear.Sw} nation #faith >god',
    'call T8 | Hear the prayer of all the nation #faith >god',
    'call T8 | Send thy rain on all our sowing &thee #faith >god',
    'call T8 | Send your rain on all our sowing &you #faith >god',
    'call T8 | Heaven, keep our {name.Sw} {virtue.Sw} #faith >god',
    'call T8 | Hold the {grounds.S} in holy keeping #faith',
    'call T8 | Come with songs of glad thanksgiving #faith',

    'lead T8 | Under heaven\'s care unending #faith',
    'lead T8 | Where the temple lamps are swaying #faith',
    'lead T8 | Where the bells are ringing slowly #faith',
    'lead T8 | In the morning of creation #faith',
    'lead T8 | When the evening prayer is ended #faith',
    'lead T8 | While the weary world is sleeping #faith',

    // ------------------------------------------------------------------ seven syllables, strong first
    'address T7 | Maker of the {grounds.S} and {grounds.S} #faith >god',
    'address T7 | Giver of the {dawn.S} and rain #faith >god',
    'address T7 | Thou whose hand has shaped the land &thee #faith >god',
    'address T7 | You whose hand has shaped the land &you #faith >god',
    'address T7 | Heaven, hear us when we pray #faith >god',
    'address T7 | Light that led us through the night #faith >god',
    'address T7 | Keeper of the {virtue.Sw} heart #faith >god',

    'state T7 | Every field is hallowed ground #faith',
    'state T7 | We have knelt and we have prayed #faith',
    'state T7 | Faith has made the weary strong #faith',
    'state T7 | Here the lamp of faith is bright #faith',
    'state T7 | Every dawn is heaven\'s light #faith',
    'state T7 | Thankful hearts are rich indeed #faith',
    'state T7 | Hands that labour, hearts that pray #faith',
    'state T7 | Bells are ringing far and near #faith',

    'call T7 | Guide our steps and light our way #faith >god',
    'call T7 | Give us bread and give us peace #faith >god',
    'call T7 | Keep us humble, keep us kind #faith >god',
    'call T7 | Teach us mercy, teach us grace #faith >god',
    'call T7 | Shelter every roof and door #faith >god',
    'call T7 | Hear the prayer of old and young #faith >god',
    'call T7 | Heaven, keep our {name.Sw} {adj.S} #faith >god',
    'call T7 | Raise a glad and thankful song #faith',

    'lead T7 | By the grace that brought us here #faith',
    'lead T7 | When we kneel at close of day #faith',
    'lead T7 | Under heaven\'s watchful eye #faith',
    'lead T7 | Where the temple bells are rung #faith',
    'lead T7 | Though the way be dark and steep #faith',
    'lead T7 | With a prayer on every tongue #faith',

    'cont T7 | And the bells ring out again #faith',
    'cont T7 | And the faithful lift their eyes #faith',
    'cont T7 | For the hand that guides is kind #faith',
    'cont T7 | And the lamp is never dim #faith',
    'cont T7 | While the candles hold their flame #faith',
    'cont T7 | While the ancient temple stands #faith',

    'contCall T7 | Till our pilgrim days are done #faith',
    'contCall T7 | By the light of heaven\'s grace #faith',
    'contCall T7 | As we raise our morning hymn #faith',
    'contCall T7 | Through the night and into day #faith',

    'close T7 | Faith our shield and hope our song #faith',
    'close T7 | Thankful hearts and open hands #faith',
    'close T7 | Blest in field and blest in home #faith',
    'close T7 | Under heaven, safe and free #faith',
    'close T7 | Kept by grace through all our days #faith',

    // ------------------------------------------------------------------ eight syllables, weak first
    'address I8 | O Maker of the {grounds.S} and {grounds.S} #faith >god',
    'address I8 | O Giver of the {dawn.S} and rain #faith >god',
    'address I8 | O Light that led us through the night #faith >god',
    'address I8 | O Heaven, hear us when we pray #faith >god',

    'state I8 | The bells ring out across the land #faith',
    'state I8 | We give our thanks for bread and rain #faith',
    'state I8 | Our faith is firm, our hope is sure #faith',
    'state I8 | The lamp of faith is burning still #faith',
    'state I8 | In quiet prayer we greet the day #faith',
    'state I8 | A grateful people bows its head #faith',

    'call I8 | O lead us on by paths of peace #faith >god',
    'call I8 | O keep us humble, keep us kind #faith >god',
    'call I8 | Be near us when the night is long #faith >god',
    'call I8 | O grant us bread, and grant us peace #faith >god',
    'call I8 | O Heaven, keep {name.wSw} {adj.S} #faith >god',
    'call I8 | And keep our {name.Sw} {adj.S} and {adj.S} #faith >god',
    'call I8 | Give thanks, give thanks, with heart and voice #faith',

    'lead I8 | Wherever faithful hearts are found #faith',
    'lead I8 | When evening bells have called us home #faith',
    'lead I8 | As long as there are prayers to say #faith',
    'lead I8 | With thankful hearts, on bended knee #faith',
    'lead I8 | For every gift of field and sky #faith',

    'cont I8 | And every heart is turned to prayer #faith',
    'cont I8 | And thankful songs are in the air #faith',
    'cont I8 | And heaven\'s light is on the hills #faith',
    'cont I8 | For we were never left alone #faith',

    'contCall I8 | Until our pilgrim days are done #faith',
    'contCall I8 | In days of plenty and of need #faith',
    'contCall I8 | And teach us mercy, teach us grace #faith >god',

    'close I8 | In faith we stand, in hope we sing #faith',
    'close I8 | With thankful hearts for evermore #faith',
    'close I8 | And heaven\'s blessing on us all #faith',
    'close I8 | Our faith, our hope, our morning light #faith',

    // ------------------------------------------------------------------ six syllables, weak first
    'state I6 | Our faith shall light the way #faith',
    'state I6 | We bow our heads in prayer #faith',
    'state I6 | The bells ring far and clear #faith',
    'state I6 | Our thanks are in our song #faith',

    'call I6 | Give thanks with heart and voice #faith',
    'call I6 | O hear us when we pray #faith >god',
    'call I6 | Be near us in the night #faith >god',
    'call I6 | O keep us in thy care &thee #faith >god',
    'call I6 | O keep us in your care &you #faith >god',

    'cont I6 | And grace is on the land #faith',
    'cont I6 | Beneath a watchful sky #faith',
    'cont I6 | And every hill is blest #faith',
    'cont I6 | Where candles hold their flame #faith',

    'contCall I6 | Till pilgrim days are done #faith',
    'contCall I6 | In plenty and in need #faith',
    'contCall I6 | By heaven\'s gentle light #faith',

    'close I6 | And blest in all we do #faith',
    'close I6 | Our shield, our lamp, our guide #faith',
    'close I6 | With thanks for every day #faith',
  ],

  titles: [
    'Under Heaven #faith',
    'The Lamp of Faith #faith',
    'Thankful Hearts #faith',
    'Bells of {name} #faith',
    'Maker of the {grounds.S} #faith',
  ],
};
