<script lang="ts">
  import { onMount } from "svelte";

  import Vex from "vexflow";
  import { MidiUtils } from "../classes/MidiUtils";

  export let clef = "treble";
  export let note: string;
  export let scaleX = 1.0;
  export let scaleY = 1.0;
  export let width = 400;
  export let height = 250;
  export let staveWidth = 400;
  export let accidental: string;
  export let color = "black";

  let noteHead;
  let voice;
  let stave;
  let context;

  let ready = false;

  onMount(() => {
    ready = true;
    prepare();
    drawNotes();
  });

  $: {
    color = color;
    note = note;
    accidental = accidental;
    clef = clef;
    if (ready) {      
      prepare();
      drawNotes();
    }
  }



  function prepare() {
    const VF = Vex.Flow;

    const div = document.getElementById("music-score");
    div.innerHTML = "";
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

    renderer.resize(width, height);
    context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
    stave = new VF.Stave(0, 0, staveWidth);

    stave.addClef(clef);
    context.scale(scaleX, scaleY);

    stave.setContext(context).draw();
  }
  function drawNotes() {
    if (!note) return;
    const VF = Vex.Flow;
    voice = new VF.Voice(VF.TIME4_4).setStrict(false);
    voice.tickables = [];

    const formatter = new VF.Formatter();

    noteHead = new VF.StaveNote({
      keys: [note],
      duration: "4",
      clef: clef,
    });
    noteHead.setStyle({
      fillStyle: color,
      strokeStyle: color,
    });
    if (accidental) {
      noteHead.addAccidental(0, new VF.Accidental(accidental));
    }

    if (MidiUtils.noteToHalfTone({ note: note, accidental: undefined }) >= 59) {
      noteHead.setStemDirection(VF.Stem.DOWN);
    }

    voice.addTickables([noteHead]);
    formatter.joinVoices([voice]).formatToStave([voice], stave);

    voice.draw(context, stave);
  }
</script>

<div>
  <div id="music-score" />
</div>
