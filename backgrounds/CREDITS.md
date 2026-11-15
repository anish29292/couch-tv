# Background photos

From Wikimedia Commons, used under their Creative Commons licences. Resized and cropped to
1920x1080 for the TV, and again at 3840x2160 from the same originals (`<name>@2x.jpg`, the same
crop) for 4K screens. The home screen shows each place and photographer under the clock.

| File | Place | Photographer | Licence | Source |
|---|---|---|---|---|
| albury-storm.jpg | Storm cloud at sunset, Albury, NSW | Thennicke | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Cumulonimbus_sunset_panorama,_Albury_NSW_Australia.jpg |
| grose-valley.jpg | Grose Valley, Blue Mountains, NSW | Diliff | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Grose_Valley,_NSW,_Australia_-_April_2013.jpg |
| tessellated-pavement.jpg | Tessellated Pavement at sunrise, Tasmania | JJ Harrison | CC BY-SA 2.5 | https://commons.wikimedia.org/wiki/File:Tessellated_Pavement_Sunrise_Landscape.jpg |
| aresquiers-beach.jpg | Aresquiers beach at sunset, France | Christian Ferrer | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Sunset_on_the_Aresquiers_beach.jpg |
| vang-vieng-sunset.jpg | Sunset over paddy fields, Vang Vieng, Laos | Basile Morin | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Colorful_sky_with_orange_clouds_reflecting_in_the_water_of_a_paddy_field,_at_sunset,_Vang_Vieng,_Laos.jpg |

## Sun collections (Alpine, Desert, Coastal)

Photos swap automatically by sun altitude throughout the day. Each collection has 4–5 photos
covering night, dawn/alpenglow, midday and golden hour.

### Alpine / Mountain (`sun-alpine/`)

| File | Place | Photographer | Licence | Source |
|---|---|---|---|---|
| sun-alpine-night.jpg | Swiss Alps at night (Milky Way) | Eddie Basler | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Stars_and_Alps.jpg |
| sun-alpine-dawn.jpg | Sheep Mountain, Montana at dawn | Jacob W. Frank / NPS | Public Domain | https://commons.wikimedia.org/wiki/File:First_light_on_Sheep_Mountain_after_a_fall_snowstorm.jpg |
| sun-alpine-alpenglow.jpg | Dolomites at alpenglow (Rifugio Mulaz) | Dmitry Djouce | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Sunrise_near_Rifugio_Mulaz_-_Dolomites,_Italy_-_2025.jpg |
| sun-alpine-midday.jpg | Sella Group, Dolomites, South Tyrol | Wolfgang Moroder | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Frea_pass_Sella_group_Pisciadu_Dolomites_South_Tyrol.jpg |
| sun-alpine-golden.jpg | Dolomites at golden hour (Baita Segantini) | Eric Kilby | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Baita_Segantini_and_Dolomites_-_Sunset_Glow.jpg |

### Desert & Canyon (`sun-desert/`)

| File | Place | Photographer | Licence | Source |
|---|---|---|---|---|
| sun-desert-night.jpg | Milky Way over Arches NP, Utah | Chris Wonderly / NPS | Public Domain | https://commons.wikimedia.org/wiki/File:Milky_Way_over_the_Garden_of_Eden_(21135225700).jpg |
| sun-desert-dawn.jpg | Mesa Arch, Canyonlands at sunrise | Thomas Wolf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Mesa_Arch_Canyonlands_sunrise.jpg |
| sun-desert-dunes.jpg | Dumont Dunes, Mojave Desert at sunrise | Jesse Pluim / BLM | Public Domain | https://commons.wikimedia.org/wiki/File:Dumont_Dunes_at_Sunrise.jpg |
| sun-desert-midday.jpg | Grand Canyon from Grandview Point | Grand Canyon NPS | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Grand_Canyon_National_Park_Grandview_Point_Panorama_0177_(7572101006).jpg |
| sun-desert-golden.jpg | Balanced Rock, Arches NP at sunset | Thomas Wolf | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Balanced_Rock_sunset.jpg |

### Coastal / Ocean (`sun-coastal/`)

Pending download (Wikimedia rate limit at time of initial setup — re-run `scripts/dl-sun-coastal.sh`).

| File | Place | Photographer | Licence | Source |
|---|---|---|---|---|
| sun-coastal-night.jpg | Milky Way over the Atacama coast, Chile | G. Hüdepohl / ESO | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Starry_night_at_the_Atacama_Desert_coast_(gerd_huedepohl_9).jpg |
| sun-coastal-dawn.jpg | Twelve Apostles, Great Ocean Road, Australia | Dietmar Rabich | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Princetown_(AU),_Port_Campbell_National_Park,_Twelve_Apostles_--_2019_--_0969.jpg |
| sun-coastal-midday.jpg | Second Beach, Olympic National Park, WA | King of Hearts | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Second_Beach_Olympic_June_2018_008.jpg |
| sun-coastal-golden.jpg | Étretat cliffs, Normandy, France | Jörg Braukmann | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Falaises_d%27Amont.jpg |


## Scene backgrounds (the default Night look)

`scene-night.jpg`, `scene-golden.jpg`, `scene-water.jpg`, `scene-fog.jpg` and `scene-dawn.jpg` were
made for couch-tv with an AI image model from text only (no source photo). They are not real places.
Use them however you like.

The files that go with them are made from those same generated scenes, so the same terms apply:

- `scene-<name>-fg.webp` (night, golden, fog, dawn): the scenery cut out of the scene, with the
  sky transparent. It is drawn over the clock, so the peaks, the volcano and the hills overlap the
  bottom of the digits. The mask came from an AI edit that painted only the sky one flat colour;
  every pixel you see in the cut-out is the original scene's. The waterline scene has no cut-out:
  its clock sits on the water instead, with a blurred reflection under the surface.
- `scene-<name>-glass.jpg`: a blurred, brightened copy of the scene, used as the clock's frosted
  glass fill.
- The 4K copies a 4K screen loads, named like the scene and its cut-out with `@2x` added before
  the extension. The scenes
  were made at 1920x1080, so these were upscaled on a computer with Real-ESRGAN (x4plus model, run
  locally, free), mixed with a plain upscale and a little grain so they keep their texture, and
  the cut-out's transparency was scaled up from the 1080 cut-out so the two line up exactly. The
  glass copy is a blur, so it has no 4K copy.

## Your own photo with the clock behind it

The easy way: `tv-home/tools/make-scene.py` makes the photo and glass copy (and, if you want it,
the cut-out) into `mine/`, and `home.my_scenes` in `config.json` designs the clock, with no code
to edit.
[docs/MAKE-A-SCENE.md](../../../docs/MAKE-A-SCENE.md) walks through it. By hand:

1. Put the photo in this folder as a 1920x1080 JPEG and add it to `SCENE_LIB` in `../app.js`.
2. The cut-out: in any background remover or image editor, delete the sky and keep everything in
   front of it (mountains, trees, buildings). Export it at the same size as a transparent WebP
   named `<photo>-fg.webp`, for example `cwebp -q 86 -alpha_q 100 -exact cutout.png -o
   <photo>-fg.webp`. Keep the edge soft but not blurry, or it shows a light rim over the digits.
   Then set `fg: true`.
3. The glass fill (optional): `magick <photo>.jpg -blur 0x16 -modulate 130,125 <photo>-glass.jpg`
   with ImageMagick, then set `glass: true`.
4. Move the clock so the scenery covers only the lower part of the digits: `.s-<id> .gclock`
   (`top`, `font-size`) and `.scene-<id> .date` in `../app.css`. Leave at least the top 60% of
   every digit clear so the time is easy to read.
