// Batch 7: labour and harvest. Words and lines for nations of workshops, forges and looms, and
// for nations of fields, orchards and full barns. The work lines are tagged #labour and the
// farming lines #harvest, so each comes only when its theme is chosen.
//
// Original writing for Anthem. Nothing here is quoted or adapted from a real anthem, hymn or song.
// How a batch is written is explained in types.ts.

import type { BatchSource } from './types.ts';

export const labour: BatchSource = {
  id: 'labour',
  title: 'Labour and harvest',
  reviewed: false,

  // More phrases for the core's groups.
  classes: {
    'gift.S': 'work #labour, bread #harvest',
    'ground.S': 'forge #labour, mine #labour, loom #labour, dock #labour, barn #harvest, vine #harvest',
    'ground.Sw': 'workshop #labour, furnace #labour, vineyard #harvest, furrow #harvest',
    'grounds.S': 'mines #labour, looms #labour, docks #labour, barns #harvest, vines #harvest, sheaves #harvest',
    'grounds.Sw': 'workshops #labour, forges #labour, vineyards #harvest',
    'kin.Sw': 'builders #labour, miners #labour, weavers #labour, farmers #harvest',
    'landadj.Sw': 'busy #labour, fruitful #harvest, fertile #harvest',
    'wedoing.Sw': 'forging #labour, weaving #labour',
  },

  templates: [
    // ================================================================== labour
    'address T8 | Land of honest toil and labour #labour >land',
    'address T8 | Land the willing hands are making #labour >land',

    'state T8 | In the forge the coals are glowing #labour',
    'state T8 | Loom and anvil, plough and hammer #labour',
    'state T8 | Every wheel and mill is turning #labour',
    'state T8 | Side by side we share the labour #labour',
    'state T8 | Each one works beside a neighbour #labour',
    'state T8 | What we make, we make together #labour',
    'state T8 | Dawn has called us to our labours #labour',

    'call T8 | Lift the hammer, set it ringing #labour',
    'call T8 | Share the bread and share the labour #labour',
    'call T8 | Build it true in wind and weather #labour',
    'call T8 | Honour all who work beside us #labour',

    'lead T8 | When the morning shift is waking #labour',
    'lead T8 | Where the busy looms are weaving #labour',
    'lead T8 | By the work of hand and hammer #labour',
    'lead T8 | While the furnace light is burning #labour',
    'lead T8 | Over all the morning clamour #labour',

    'address T7 | Land of hammer, loom and plough #labour >land',
    'address T7 | Land that honest hands have made #labour >land',
    'address T7 | Home of every useful trade #labour >land',

    'state T7 | Every hand has work to do #labour',
    'state T7 | Many hands have raised the walls #labour',
    'state T7 | Honest toil has made us strong #labour',
    'state T7 | Day by day we earn our bread #labour',
    'state T7 | Forge and furnace light the night #labour',
    'state T7 | Skill of hand and strength of will #labour',

    'call T7 | Swing the hammer, turn the wheel #labour',
    'call T7 | Build it well and build it true #labour',
    'call T7 | Give each hand its honest due #labour',
    'call T7 | Share the work and share the bread #labour',

    'lead T7 | From the workshop and the mine #labour',
    'lead T7 | When the whistle wakes the town #labour',
    'lead T7 | By the work of every hand #labour',
    'lead T7 | Where the hammer rings on steel #labour',

    'cont T7 | And the anvils ring all day #labour',
    'cont T7 | And the looms are never still #labour',
    'cont T7 | For the work is ours to share #labour',
    'cont T7 | While the furnace lights the sky #labour',

    'contCall T7 | Till the evening whistle blows #labour',
    'contCall T7 | With a strong and willing hand #labour',
    'contCall T7 | Till the working day is done #labour',

    'close T7 | Work of hand and work of mind #labour',
    'close T7 | Proud of all our hands have made #labour',
    'close T7 | Bread for all and rest well won #labour',
    'close T7 | Built by many, built to last #labour',

    'address I8 | O land of hammer, loom and plough #labour >land',
    'address I8 | O land that honest hands have made #labour >land',

    'state I8 | The hammers ring, the wheels go round #labour',
    'state I8 | We earn our bread with honest hands #labour',
    'state I8 | The work is hard, the will is strong #labour',
    'state I8 | Our hands have built the roads and walls #labour',
    'state I8 | The furnace glows, the anvil rings #labour',

    'call I8 | Take up the tools and build anew #labour',
    'call I8 | Let every hand be skilled and sure #labour',
    'call I8 | Come, share the work and share the bread #labour',

    'lead I8 | From mine and mill, from forge and yard #labour',
    'lead I8 | Wherever honest work is done #labour',
    'lead I8 | By every hand that plies a trade #labour',
    'lead I8 | When morning lights the workshop door #labour',

    'cont I8 | And every trade shall have its due #labour',
    'cont I8 | And none who works shall want for bread #labour',
    'cont I8 | For many hands have made it so #labour',
    'cont I8 | And what we built together stands #labour',

    'contCall I8 | Until the working day is done #labour',
    'contCall I8 | With willing hand and steady heart #labour',

    'close I8 | The work we share has made us one #labour',
    'close I8 | And proud of all our hands have made #labour',
    'close I8 | Our hands, our tools, our daily bread #labour',

    'state I6 | The hammers ring all day #labour',
    'state I6 | Our hands have built it all #labour',
    'state I6 | We earn our daily bread #labour',
    'state I6 | The work of ages stands #labour',

    'call I6 | Take up the tools again #labour',
    'call I6 | Come, lend a willing hand #labour',
    'call I6 | Build well, and build to last #labour',

    'cont I6 | With hammer, loom and plough #labour',
    'cont I6 | And every wheel goes round #labour',
    'cont I6 | From forge and mill and mine #labour',

    'contCall I6 | Till working days are done #labour',
    'contCall I6 | With strong and willing hands #labour',

    'close I6 | The work has made us one #labour',
    'close I6 | And bread for every hand #labour',
    'close I6 | Our labour and our pride #labour',

    // ================================================================== harvest
    'address T8 | Land of sowing, land of reaping #harvest >land',
    'address T8 | Land where golden grain is growing #harvest >land',

    'state T8 | In the fields the wheat is yellow #harvest',
    'state T8 | Autumn finds the orchards mellow #harvest',
    'state T8 | Spring is here, the time for sowing #harvest',
    'state T8 | Every barn and bin is filling #harvest',
    'state T8 | Glad the hands and good the tilling #harvest',
    'state T8 | What we planted, we are reaping #harvest',

    'call T8 | Bless the seed that we are sowing #harvest',
    'call T8 | Share the loaf with friend and neighbour #harvest',
    'call T8 | Thank the earth for all its giving #harvest',

    'lead T8 | When the reaping day is ending #harvest',
    'lead T8 | When the apple boughs are bending #harvest',
    'lead T8 | From the sowing to the reaping #harvest',
    'lead T8 | While the ripened fields are gleaming #harvest',

    'address T7 | Land of orchard, field and vine #harvest >land',
    'address T7 | Land of wheat and summer rain #harvest >land',
    'address T7 | Mother of the golden grain #harvest >land',

    'state T7 | Rich the soil and warm the sun #harvest',
    'state T7 | Every barn is full again #harvest',
    'state T7 | We have ploughed and we have sown #harvest',
    'state T7 | Seed and season keep their word #harvest',
    'state T7 | Orchards bend with summer fruit #harvest',
    'state T7 | Good the year and full the store #harvest',
    'state T7 | Deep the soil and strong the root #harvest',

    'call T7 | Bless the seed and bless the ground #harvest',
    'call T7 | Bind the wheat and stack it high #harvest',
    'call T7 | Set a place for every guest #harvest',
    'call T7 | Thank the earth that feeds us all #harvest',

    'lead T7 | When the wheat is tall and gold #harvest',
    'lead T7 | From the seed to gathered sheaves #harvest',
    'lead T7 | When the autumn work is done #harvest',
    'lead T7 | By the plough our {elders.Sw} drove #harvest',

    'cont T7 | And the barns are full of grain #harvest',
    'cont T7 | And the reapers take their rest #harvest',
    'cont T7 | While the vines are heavy still #harvest',
    'cont T7 | For the soil is deep and good #harvest',

    'contCall T7 | Till the last of sheaves is bound #harvest',
    'contCall T7 | While the summer days are long #harvest',
    'contCall T7 | For the winter yet to come #harvest',

    'close T7 | Bread enough for every door #harvest',
    'close T7 | Full the barn and glad the heart #harvest',
    'close T7 | Plenty shared is plenty still #harvest',

    'address I8 | O land of orchard, field and vine #harvest >land',
    'address I8 | O mother of the golden grain #harvest >land',

    'state I8 | The wheat is tall, the vines are green #harvest',
    'state I8 | The barns are full, the year is good #harvest',
    'state I8 | We sow in spring and wait for rain #harvest',
    'state I8 | The orchards bend, the boughs hang low #harvest',
    'state I8 | The earth is kind to patient hands #harvest',

    'call I8 | Come, gather in the ripened grain #harvest',
    'call I8 | Give thanks for seed and sun and rain #harvest',
    'call I8 | Let no one hunger at our door #harvest',

    'lead I8 | When autumn fills the barn and bin #harvest',
    'lead I8 | From furrow, field and orchard bough #harvest',
    'lead I8 | As sure as seeds grow into sheaves #harvest',
    'lead I8 | Wherever wheat and barley grow #harvest',
    'lead I8 | From spreading bough to buried root #harvest',
    'lead I8 | Through all the green and fruitful lands #harvest',

    'cont I8 | And every table has its bread #harvest',
    'cont I8 | And reapers sing along the rows #harvest',
    'cont I8 | For all we planted has been blessed #harvest',

    'contCall I8 | Until the last of sheaves is bound #harvest',
    'contCall I8 | Before the winter winds return #harvest',

    'close I8 | With bread enough for every door #harvest',
    'close I8 | The earth has given, and we share #harvest',
    'close I8 | Our fields, our bread, our common store #harvest',

    'state I6 | The barns are full again #harvest',
    'state I6 | The wheat is tall and gold #harvest',
    'state I6 | The year has kept its word #harvest',

    'call I6 | Come, gather in the grain #harvest',
    'call I6 | Give thanks for sun and rain #harvest',
    'call I6 | Let all the hungry eat #harvest',

    'cont I6 | Among the ripened wheat #harvest',
    'cont I6 | And orchards hang with fruit #harvest',
    'cont I6 | From seed to gathered sheaves #harvest',
    'cont I6 | Along the golden rows #harvest',
    'cont I6 | Across the fruitful lands #harvest',

    'contCall I6 | Till all the sheaves are bound #harvest',
    'contCall I6 | Before the year is old #harvest',

    'close I6 | And bread at every door #harvest',
    'close I6 | The harvest of our hands #harvest',
    'close I6 | And plenty for us all #harvest',
  ],

  titles: [
    'The Work of Many Hands #labour',
    'By Honest Hands #labour',
    'Hammer, Loom and Plough #labour',
    'The Golden Grain #harvest',
    'Seed and Season #harvest',
    'When the Wheat Is Tall #harvest',
  ],
};
