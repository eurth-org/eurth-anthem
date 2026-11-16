// Batch 2: sea, rivers and harbours. Words and lines for nations of coasts, ships and running
// water. The sea lines are tagged #sea and the river lines #rivers, so each comes only when its
// theme is chosen.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const sea: BatchSource = {
  id: 'sea',
  title: 'Sea, rivers and harbours',
  reviewed: false,

  // More phrases for the core's groups.
  classes: {
    'ground.S': 'sea #sea, wave #sea, coast #sea, cape #sea, quay #sea, cliff #sea, bank #rivers, ford #rivers, bridge #rivers, lake #rivers, mill #rivers',
    'ground.Sw': 'ocean #sea, lighthouse #sea, ferry #rivers',
    'grounds.S': 'seas #sea, waves #sea, sails #sea, ships #sea, cliffs #sea, tides #sea, bays #sea, banks #rivers, lakes #rivers, springs #rivers, fords #rivers, mills #rivers',
    'grounds.Sw': 'oceans #sea, breakers #sea, bridges #rivers, ferries #rivers',
    'landadj.Sw': 'windswept #sea',
    'kin.Sw': 'sailors #sea, fishers #sea',
    'trial.S': 'gale #sea',
  },

  templates: [
    // ------------------------------------------------------------------ eight syllables, strong first
    'address T8 | Land of tide and rolling waters #sea >land',
    'address T8 | Land of sail and shining ocean #sea >land',
    'address T8 | Land of gulls and windswept harbours #sea >land',

    'state T8 | Still the faithful tide is flowing #sea',
    'state T8 | On the shore the waves are breaking #sea',
    'state T8 | Every sail is homeward turning #sea',
    'state T8 | In the dark the lamp is burning #sea',
    'state T8 | In the harbour bells are ringing #sea',
    'state T8 | Here the land and sea are meeting #sea',
    'state T8 | Wind and wave have made us steadfast #sea',
    'state T8 | Still the morning mist is lifting #sea',

    'call T8 | Guide the sailor through the darkness #sea',
    'call T8 | Keep the harbour lantern burning #sea',
    'call T8 | Bless the ships upon the ocean #sea',
    'call T8 | Hold us fast when storms are breaking #sea',
    'call T8 | Sing it, wind, and sing it, waters #sea',
    'call T8 | Give the homeward fleet a greeting #sea',

    'lead T8 | From the harbour to the ocean #sea',
    'lead T8 | Where the gulls are homeward winging #sea',
    'lead T8 | When the evening tide is turning #sea',
    'lead T8 | Where the restless waves are breaking #sea',
    'lead T8 | By the salt and silver waters #sea',
    'lead T8 | Though the wind and tide be shifting #sea',

    'address T8 | Land of bridges, land of rivers #rivers >land',
    'state T8 | Down the vale the stream is flowing #rivers',
    'state T8 | Old the river, young the morning #rivers',
    'call T8 | Let the river tell the story #rivers',
    'lead T8 | Where the river meets the meadow #rivers',
    'lead T8 | Where the bridge has cast its shadow #rivers',
    'lead T8 | From the hillside to the waters #rivers',

    // ------------------------------------------------------------------ seven syllables, strong first
    'address T7 | Land of harbour, sail and tide #sea >land',
    'address T7 | Land between the hills and sea #sea >land',
    'address T7 | Land the sea has made its own #sea >land',
    'address T7 | Daughter of the wind and wave #sea >land',
    'address T7 | Home of all who sail the sea #sea >land',

    'state T7 | Every tide shall bring us home #sea',
    'state T7 | Wind and wave have made us one #sea',
    'state T7 | Here the sea and sky are wide #sea',
    'state T7 | We have sailed through storm and gale #sea',
    'state T7 | Ours the shore and ours the sea #sea',
    'state T7 | Still the beacon keeps its light #sea',

    'call T7 | Guide the sailor safely home #sea',
    'call T7 | Keep the lantern burning bright #sea',
    'call T7 | Raise the sail and greet the day #sea',
    'call T7 | Bless the fleet and bless the shore #sea',
    'call T7 | Hold the course through wind and wave #sea',
    'call T7 | Stand like cliffs against the tide #sea',

    'lead T7 | From the harbour to the sea #sea',
    'lead T7 | Where the river meets the tide #sea',
    'lead T7 | When the storm is on the deep #sea',
    'lead T7 | Though the waves be wild and high #sea',
    'lead T7 | By the foam along the shore #sea',
    'lead T7 | Where the gulls and breakers cry #sea',
    'lead T7 | While the tide runs out and in #sea',

    'cont T7 | And the gulls are in the sky #sea',
    'cont T7 | And the tide is running free #sea',
    'cont T7 | While the lantern lights the bay #sea',
    'cont T7 | And the sea-wind fills the sail #sea',
    'cont T7 | As the wave returns to shore #sea',

    'contCall T7 | Till the fleet is safely home #sea',
    'contCall T7 | While the tide is on the turn #sea',
    'contCall T7 | Through the gale and through the foam #sea',
    'contCall T7 | For the sailors far from shore #sea',

    'close T7 | Sure as tide returns to shore #sea',
    'close T7 | Steady as the turning tide #sea',
    'close T7 | Free as wind and wide as sea #sea',
    'close T7 | Wave and wind shall keep us free #sea',
    'close T7 | Harbour, hearth and home are one #sea',

    'address T7 | Land of river, bridge and mill #rivers >land',
    'state T7 | Every river knows its way #rivers',
    'state T7 | All our streams run down as one #rivers',
    'call T7 | Let the river bear the song #rivers',
    'call T7 | Follow where the river leads #rivers',
    'lead T7 | Where the quiet waters flow #rivers',
    'lead T7 | By the bridge our {elders.Sw} made #rivers',
    'cont T7 | And the mill-wheel turns again #rivers',
    'cont T7 | While the willows line the stream #rivers',
    'close T7 | Sure as rivers find their way #rivers',
    'close T7 | Many streams, a single flow #rivers',

    // ------------------------------------------------------------------ eight syllables, weak first
    'address I8 | O land of harbour, sail and tide #sea >land',
    'address I8 | O land between the hills and sea #sea >land',
    'address I8 | O daughter of the wind and wave #sea >land',

    'state I8 | The sea is wide, the sky is high #sea',
    'state I8 | The lantern burns above the bay #sea',
    'state I8 | Our ships go out, our ships come home #sea',
    'state I8 | The harbour lights are burning bright #sea',
    'state I8 | The gulls cry out above the foam #sea',
    'state I8 | We read the weather in the sky #sea',

    'call I8 | O guide our sailors through the night #sea',
    'call I8 | Set sail, set sail, and greet the day #sea',
    'call I8 | Come wind, come wave, we hold the shore #sea',
    'call I8 | Let every harbour ring with song #sea',

    'lead I8 | From harbour wall to open sea #sea',
    'lead I8 | Wherever wind and water meet #sea',
    'lead I8 | When storm and darkness hide the shore #sea',
    'lead I8 | As long as tides shall rise and fall #sea',
    'lead I8 | Beyond the reef, beyond the bay #sea',

    'cont I8 | And gulls are calling down the bay #sea',
    'cont I8 | For we were cradled by the sea #sea',
    'cont I8 | And every wave has known our name #sea',

    'contCall I8 | Till every sail is safely home #sea',
    'contCall I8 | Through wind and wave, by night and day #sea',
    'contCall I8 | For all who sail beyond the bay #sea',

    'close I8 | As sure as tide returns to shore #sea',
    'close I8 | The sea is ours, and we are free #sea',
    'close I8 | One shore, one sea, one steady light #sea',
    'close I8 | And steady as the turning tide #sea',

    'state I8 | The river runs, the river sings #rivers',
    'state I8 | The mill-wheel turns, the waters flow #rivers',
    'call I8 | Run clear, run strong, and bless the land #rivers',
    'lead I8 | Wherever running waters go #rivers',
    'lead I8 | Beside the river, bright and slow #rivers',
    'cont I8 | And every bridge has heard our song #rivers',
    'close I8 | Our many streams have joined as one #rivers',

    // ------------------------------------------------------------------ six syllables, weak first
    'state I6 | The tide is running free #sea',
    'state I6 | Our hearts are on the sea #sea',
    'state I6 | The harbour lights are bright #sea',
    'state I6 | The sea has made us one #sea',

    'call I6 | Set sail and greet the day #sea',
    'call I6 | O guide them safely home #sea',
    'call I6 | Stand firm against the tide #sea',
    'call I6 | O bless the ships at sea #sea',

    'cont I6 | And gulls are in the sky #sea',
    'cont I6 | Along the windy shore #sea',
    'cont I6 | And salt is in the air #sea',
    'cont I6 | From harbour wall to bay #sea',
    'cont I6 | Beside the restless sea #sea',

    'contCall I6 | Till all the fleet is home #sea',
    'contCall I6 | Through wind and wave and foam #sea',
    'contCall I6 | By star and lantern light #sea',
    'contCall I6 | For sailors far from shore #sea',

    'close I6 | As steady as the tide #sea',
    'close I6 | The sea shall keep us free #sea',
    'close I6 | Our harbour and our home #sea',
    'close I6 | And free as wind and wave #sea',

    'state I6 | The river knows its way #rivers',
    'call I6 | Run on and bless the land #rivers',
    'cont I6 | Beside the running stream #rivers',
    'cont I6 | And all the rivers sing #rivers',
    'contCall I6 | As long as rivers flow #rivers',
    'close I6 | Our many streams are one #rivers',
  ],

  titles: [
    'Steady as the Tide #sea',
    'Harbour Lights #sea',
    'The Lantern and the Tide #sea',
    'Wind and Wave #sea',
    '{name}, Daughter of the Sea #sea',
    'Where the Waters Flow #rivers',
    'Many Streams #rivers',
  ],
};
