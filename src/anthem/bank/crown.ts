// Batch 8: the crown. Words and lines for kingdoms, principalities and empires: the throne, the
// oath, banners and heralds. Tagged #crown, so they come only when that theme is chosen. The
// lines speak of the crown and the throne and never of a king or a queen, so they suit whoever
// reigns.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const crown: BatchSource = {
  id: 'crown',
  title: 'The crown',
  reviewed: false,

  // More phrases for the core's groups.
  classes: {
    'ground.S': 'throne #crown, court #crown, gate #crown',
    'ground.Sw': 'castle #crown, palace #crown',
    'grounds.S': 'courts #crown, gates #crown',
    'grounds.Sw': 'castles #crown',
    'landadj.Sw': 'royal #crown',
    'dear.Sw': 'royal #crown',
    'nation.Sw': 'kingdom #crown',
  },

  templates: [
    // ------------------------------------------------------------------ eight syllables, strong first
    'address T8 | Realm of old and royal story #crown >land',
    'address T8 | Kingdom by the brave defended #crown >land',
    'address T8 | Land of throne and {landadj.Sw} {grounds.Sw} #crown >land',

    'state T8 | To the crown our hearts are loyal #crown',
    'state T8 | Proud the line, and old, and royal #crown',
    'state T8 | From an ancient line descended #crown',
    'state T8 | From the walls the flag is streaming #crown',
    'state T8 | Throne and people stand together #crown',
    'state T8 | Oaths we swore are oaths for ever #crown',
    'state T8 | Bells proclaim the coronation #crown',
    'state T8 | Never shall the oath be broken #crown',
    'state T8 | Just the hand that is commanding #crown',

    'call T8 | Guard the crown our {elders.Sw} {kept.Sw} #crown',
    'call T8 | Sound the trumpets, set them ringing #crown',
    'call T8 | Keep the throne in {gift.S} and {gift.Sw} #crown',
    'call T8 | Bless the crown and bless the nation #crown',

    'lead T8 | By the throne our {elders.Sw} {kept.Sw} #crown',
    'lead T8 | Since the day of coronation #crown',
    'lead T8 | Under banners old and royal #crown',
    'lead T8 | While the ancient throne is standing #crown',
    'lead T8 | Where the royal halls are ringing #crown',

    // ------------------------------------------------------------------ seven syllables, strong first
    'address T7 | Land of sceptre, crown and throne #crown >land',
    'address T7 | Realm of honour and renown #crown >land',
    'address T7 | Kingdom old and ever new #crown >land',
    'address T7 | Land beneath a faithful crown #crown >land',

    'state T7 | Crown and people stand as one #crown',
    'state T7 | Loyal hearts surround the throne #crown',
    'state T7 | Old the oath and firm the hand #crown',
    'state T7 | Still the royal banners fly #crown',
    'state T7 | Just the law and mild the reign #crown',
    'state T7 | We have sworn and we shall keep #crown',
    'state T7 | Every hall has heard the horn #crown',

    'call T7 | Guard the crown and guard the right #crown',
    'call T7 | Keep the oath our {elders.Sw} swore #crown',
    'call T7 | Sound the trumpet, beat the drum #crown @march',
    'call T7 | Serve the realm with heart and hand #crown',
    'call T7 | Raise the banner of the crown #crown',

    'lead T7 | By the walls of ancient stone #crown',
    'lead T7 | Since the crown was first bestowed #crown',
    'lead T7 | While the royal standard flies #crown',
    'lead T7 | When the heralds sound the call #crown',
    'lead T7 | Under one unbroken line #crown',

    'cont T7 | And the heralds cry the name #crown',
    'cont T7 | And the banners fill the hall #crown',
    'cont T7 | For the crown is justly worn #crown',
    'cont T7 | While the throne and people stand #crown',

    'contCall T7 | For the honour of the crown #crown',
    'contCall T7 | While the ancient line remains #crown',
    'contCall T7 | By the oath that makes us one #crown',

    'close T7 | Crown and people, heart and hand #crown',
    'close T7 | Loyal now and loyal still #crown',
    'close T7 | Throne and hearth and realm are one #crown',
    'close T7 | Faithful to the ancient throne #crown',

    // ------------------------------------------------------------------ eight syllables, weak first
    'address I8 | O land of sceptre, crown and throne #crown >land',
    'address I8 | O realm of honour and renown #crown >land',

    'state I8 | The crown is bright, the realm is strong #crown',
    'state I8 | Our oath is old, our hearts are true #crown',
    'state I8 | The royal banner greets the day #crown',
    'state I8 | A loyal people guards the throne #crown',
    'state I8 | The trumpets sound from wall to wall #crown',

    'call I8 | Stand fast, stand true, beside the crown #crown',
    'call I8 | Let trumpets sound and banners fly #crown',
    'call I8 | O keep the oath our {elders.Sw} swore #crown',

    'lead I8 | Beneath the banner of the crown #crown',
    'lead I8 | As long as crown and realm endure #crown',
    'lead I8 | From castle gate to cottage door #crown',
    'lead I8 | By ancient law and ancient right #crown',

    'cont I8 | And loyal hearts are gathered round #crown',
    'cont I8 | And every hall has heard the name #crown',
    'cont I8 | For crown and people share one fate #crown',

    'contCall I8 | For crown and country, hearth and home #crown',
    'contCall I8 | As long as there are oaths to keep #crown',

    'close I8 | One crown, one people, and one land #crown',
    'close I8 | And loyal we shall ever be #crown',
    'close I8 | The realm is ours, and we are true #crown',

    // ------------------------------------------------------------------ six syllables, weak first
    'state I6 | Our oath is old and true #crown',
    'state I6 | The banners greet the day #crown',
    'state I6 | We guard the ancient throne #crown',

    'call I6 | Stand true beside the crown #crown',
    'call I6 | Let all the trumpets sound #crown',
    'call I6 | Now keep the oath we swore #crown',

    'cont I6 | Beneath a faithful crown #crown',
    'cont I6 | And banners fill the hall #crown',
    'cont I6 | From castle wall to shore #crown',

    'contCall I6 | For crown and hearth and home #crown',
    'contCall I6 | While throne and realm endure #crown',

    'close I6 | For crown and realm and right #crown',
    'close I6 | And loyal to the end #crown',
    'close I6 | One people and one crown #crown',
  ],

  titles: [
    'Crown and People #crown',
    'The Faithful Crown #crown',
    'The Oath We Keep #crown',
    'Banner of {name} #crown',
    'Throne and Hearth #crown',
  ],
};
