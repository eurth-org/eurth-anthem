// Batch 3: mountains, the north and snow. Words and lines for nations of peaks and passes, and
// for nations of long winters. The mountain lines are tagged #mountains and the northern lines
// #north, so each comes only when its theme is chosen.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const mountains: BatchSource = {
  id: 'mountains',
  title: 'Mountains, the north and snow',
  reviewed: false,

  // More phrases for the core's groups.
  classes: {
    'ground.S': 'crag #mountains, ridge #mountains, pass #mountains, glen #mountains, slope #mountains, pine #north, fjord #north',
    'ground.Sw': 'summit #mountains, glacier #north',
    'grounds.S': 'heights #mountains, crags #mountains, slopes #mountains, pines #north #mountains, snows #north, fjords #north',
    'grounds.Sw': 'summits #mountains, ridges #mountains, uplands #mountains, glaciers #north',
    'landadj.Sw': 'rugged #mountains, lofty #mountains, snowy #north #mountains, frozen #north, northern #north',
    'kin.Sw': 'shepherds #mountains',
    'trial.S': 'snow #north, ice #north',
  },

  templates: [
    // ================================================================== mountains
    // ------------------------------------------------------------------ eight syllables, strong first
    'address T8 | Land of eagles, land of mountains #mountains >land',
    'address T8 | Land of pine and purple heather #mountains >land',
    'address T8 | Daughter of the cloud and thunder #mountains >land',

    'state T8 | From the heights the streams are falling #mountains',
    'state T8 | Stone on stone our homes are founded #mountains',
    'state T8 | Hard the road and steep the climbing #mountains',
    'state T8 | In the vale the bells are ringing #mountains',
    'state T8 | We were cradled by the mountains #mountains',
    'state T8 | Clouds may gather, peaks may thunder #mountains',

    'call T8 | Hear the distant summits calling #mountains',
    'call T8 | Sound the horn across the valleys #mountains',
    'call T8 | Let the valleys fill with wonder #mountains',
    'call T8 | Guard the pass and hold the highlands #mountains',
    'call T8 | Keep the watch till night is ending #mountains',

    'lead T8 | From the valleys to the summits #mountains',
    'lead T8 | Where the eagle rides the weather #mountains',
    'lead T8 | Through the cloud and through the thunder #mountains',
    'lead T8 | Where the mountain streams are falling #mountains',
    'lead T8 | High among the pine and heather #mountains',
    'lead T8 | By the lofty peaks surrounded #mountains',
    'lead T8 | While the herds are homeward wending #mountains',

    // ------------------------------------------------------------------ seven syllables, strong first
    'address T7 | Land of mountain, pine and stone #mountains >land',
    'address T7 | Land of eagle, cloud and height #mountains >land',
    'address T7 | Land where earth and heaven meet #mountains >land',
    'address T7 | Daughter of the peak and sky #mountains >land',

    'state T7 | Every peak is crowned with light #mountains',
    'state T7 | Stone and summit know our name #mountains',
    'state T7 | We were cradled in the heights #mountains',
    'state T7 | Steep the road and strong the will #mountains',
    'state T7 | Here the eagle makes her home #mountains',
    'state T7 | Firm as mountains, here we stand #mountains',

    'call T7 | Climb together to the height #mountains',
    'call T7 | Stand as mountains stand, and stay #mountains',
    'call T7 | Hold the pass and keep the way #mountains',

    'lead T7 | From the valley to the peak #mountains',
    'lead T7 | Where the eagle rides the air #mountains',
    'lead T7 | Though the path be steep and long #mountains',
    'lead T7 | Where the pine and granite meet #mountains',

    'cont T7 | And the peaks are bright with snow #mountains',
    'cont T7 | And the echoes answer clear #mountains',
    'cont T7 | While the eagle rides the sky #mountains',
    'cont T7 | And the mountain keeps its own #mountains',

    'contCall T7 | Till the echoes fill the sky #mountains',
    'contCall T7 | While the mountains guard our sleep #mountains',
    'contCall T7 | Through the cloud and through the snow #mountains',

    'close T7 | Firm as stone and free as air #mountains',
    'close T7 | High of heart as mountains are #mountains',
    'close T7 | Sure as mountains meet the sky #mountains',
    'close T7 | Steadfast as the ancient stone #mountains',

    // ------------------------------------------------------------------ eight syllables, weak first
    'address I8 | O land of mountain, pine and stone #mountains >land',
    'address I8 | O daughter of the peak and sky #mountains >land',

    'state I8 | The peaks are white, the sky is wide #mountains',
    'state I8 | The eagle rides the morning air #mountains',
    'state I8 | The mountains watch, the valleys sleep #mountains',
    'state I8 | We climb together, hand in hand #mountains',
    'state I8 | The echoes carry far and clear #mountains',

    'call I8 | Stand firm as mountains, proud and high #mountains',
    'call I8 | Come, sound the horn from height to height #mountains',
    'call I8 | O guard the pass and keep the way #mountains',

    'lead I8 | From valley floor to mountain crown #mountains',
    'lead I8 | Wherever peak and heaven meet #mountains',
    'lead I8 | Above the cloud, above the snow #mountains',
    'lead I8 | As long as mountains touch the sky #mountains',

    'cont I8 | And every summit shines with snow #mountains',
    'cont I8 | And eagles circle in the sky #mountains',
    'cont I8 | For we were cradled by the stone #mountains',

    'contCall I8 | Till every valley hears the song #mountains',
    'contCall I8 | By mountain road and valley way #mountains',

    'close I8 | As steadfast as the ancient stone #mountains',
    'close I8 | The heights are ours, and we are free #mountains',
    'close I8 | And firm as mountains we shall stand #mountains',

    // ------------------------------------------------------------------ six syllables, weak first
    'state I6 | The peaks are crowned with light #mountains',
    'state I6 | Our hearts are in the heights #mountains',
    'state I6 | The mountains know our name #mountains',

    'call I6 | Stand firm as mountain stone #mountains',
    'call I6 | Climb on and greet the day #mountains',

    'cont I6 | And eagles ride the air #mountains',
    'cont I6 | Among the pine and stone #mountains',
    'cont I6 | Beneath the mountain sky #mountains',
    'cont I6 | And snow is on the height #mountains',

    'contCall I6 | Till echoes fill the sky #mountains',
    'contCall I6 | By steep and stony way #mountains',

    'close I6 | As firm as mountain stone #mountains',
    'close I6 | And free as mountain air #mountains',
    'close I6 | The heights shall keep us free #mountains',

    // ================================================================== the north and snow
    'address T8 | Land of snow and northern starlight #north >land',
    'address T8 | Land of pine and silent winter #north >land',
    'state T8 | Soft and deep the snow is falling #north',
    'state T8 | In the hearth the logs are glowing #north',
    'state T8 | Long the night, and bright the embers #north',
    'state T8 | Every heart at home remembers #north',
    'call T8 | Light the lamps against the winter #north',
    'call T8 | Gather in when night is falling #north',
    'lead T8 | When the winter wind is blowing #north',
    'lead T8 | Under stars of northern winter #north',
    'lead T8 | Through the long and frozen darkness #north',

    'address T7 | Land of snow and northern light #north >land',
    'address T7 | Land beneath the northern star #north >land',
    'state T7 | Long the winter, warm the home #north',
    'state T7 | Stars are bright above the snow #north',
    'state T7 | We have known the frost and cold #north',
    'call T7 | Light the lamp against the night #north',
    'call T7 | Keep us warm through frost and snow #north',
    'lead T7 | When the frost is on the pine #north',
    'lead T7 | Though the winter night be long #north',
    'lead T7 | Where the northern lights are bright #north',
    'cont T7 | And the stars are sharp and clear #north',
    'cont T7 | While the snow lies deep and white #north',
    'contCall T7 | Till the spring returns again #north',
    'contCall T7 | Through the dark and through the cold #north',
    'close T7 | Warm of heart in frost and snow #north',
    'close T7 | Bright as stars on winter nights #north',

    'address I8 | O land of snow and northern light #north >land',
    'state I8 | The night is long, the stars are near #north',
    'state I8 | The snow lies deep on field and pine #north',
    'call I8 | Draw near, draw near, and share the light #north',
    'lead I8 | When winter comes with frost and snow #north',
    'lead I8 | Beneath the cold and shining stars #north',
    'cont I8 | And every window shows a light #north',
    'contCall I8 | Until the spring returns again #north',
    'close I8 | And warm of heart in frost and snow #north',
    'close I8 | The north is ours, and we are home #north',

    'state I6 | The stars are sharp and clear #north',
    'state I6 | The snow is deep and white #north',
    'call I6 | Draw near and share the light #north',
    'cont I6 | Beneath the northern star #north',
    'cont I6 | And frost is on the pine #north',
    'contCall I6 | Through winter dark and cold #north',
    'contCall I6 | Till spring returns again #north',
    'close I6 | And warm in frost and snow #north',
    'close I6 | Our hearth, our hope, our home #north',
  ],

  titles: [
    'Firm as the Mountains #mountains',
    'The Eagle and the Stone #mountains',
    'Heights of {name} #mountains',
    'Under the Northern Star #north',
    'Snow and Starlight #north',
  ],
};
