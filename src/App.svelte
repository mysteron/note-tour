<script lang="ts">
  import Keyboard from "./components/Keyboard.svelte";
  import { MidiUtils } from "./classes/MidiUtils";
  import { onMount } from "svelte";
  import { map } from "rxjs";
  import StaveDrawer from "./components/StaveDrawer.svelte";

  export let name: string;

  let audioContext: AudioContext;
  let oscscillators: { [id: number]: OscillatorNode } = {};
  let started = false;
  let actives: number[] = [];
  let audioOn = false;
  let guessedNote;
  let guessedAccidental;
  let notesTotal = 0;
  let notesGood = 0;
  let currentClef = "treble";
  const noteNames = ["C", "D", "E", "F", "G", "A", "H"];
  let notes;
  let noteColor = "black";
  let note;
  let accidental;
  let keyNote;
  let keyAccidental;
  let goodInARow = 0;
  const accidentals = [undefined, "b", "#"];

  const midiUtils = new MidiUtils();
  let midiInputs: any[] = [
    [
      "none_keyboard",
      {
        name: "None (on-screen keyboard)",
        state: "",
      },
    ],
    [
      "none_buttons",
      {
        name: "None (note names)",
        state: "",
      },
    ],
  ];

  let currentInput = midiInputs[0][0];

  $: {
    midiUtils.Ready.then(() => {
      midiUtils.setActiveInput(currentInput);
      midiUtils.onKeyDown
        .pipe(map((midiNote) => midiNote.note))
        .subscribe(keyDown);
      midiUtils.onKeyUp.pipe(map((midiNote) => midiNote.note)).subscribe(keyUp);
    });
  }

  $: {
    if (audioOn) {
      setAudio();
    }
  }

  $: accuracy = notesTotal > 0 ? Math.round((notesGood / notesTotal) * 100) : 0;

  $: accuracyText = started ? `${accuracy}%` : "";

  $: guessedNoteText = guessedNote
    ? `${guessedNote.split("/")[0].toUpperCase()}${guessedAccidental || ""}`
    : "...";

  $: {
    const noteNames = ["c", "d", "e", "f", "g", "a", "b"];
    const octaves = currentClef === "treble" ? ["4", "5"] : ["3"];
    const out = [];
    octaves.forEach((o) => {
      noteNames.forEach((n) => {
        out.push(`${n}/${o}`);
      });
    });
    notes = out;
  }

  $: {
    if (keyNote && keyAccidental) {
      checkKeyNote();
      keyNote = undefined;
      keyAccidental = undefined;
    }
  }

  onMount(() => {
    midiUtils.Ready.then(() => {
      midiInputs.unshift(...Array.from(midiUtils.getInputsMap()));
      midiInputs = midiInputs;
    });
  });

  function checkKeyNote() {
    const actual = MidiUtils.noteToHalfTone(
      {
        note: keyNote,
        accidental: keyAccidental,
      },
      true
    );
    check(actual, true);
  }

  function keyDown(num) {
    const note = MidiUtils.midiNoteToNote(num);
    const actual = MidiUtils.noteToHalfTone(note);
    if (started) {
      check(actual);
    }
    if (!actives.includes(num)) {
      actives.push(num);
      actives = actives;
      if (audioOn) {
        oscscillators[num] = playSweep(num);
      }
    }
  }

  function keyUp(num) {
    if (actives.includes(num)) {
      actives = actives.filter((el) => el !== num);
      if (audioOn) {
        oscscillators[num].stop(0);
        oscscillators[num].disconnect();
        delete oscscillators[num];
      }
    }
  }

  function check(actual, noOctave = false) {
    const expected = MidiUtils.noteToHalfTone(
      {
        note,
        accidental,
      },
      noOctave
    );

    if (actual === expected) {
      guessedNote = note;
      guessedAccidental = accidental;
      noteColor = "green";
      setTimeout(() => {
        nextNote();
      }, 200);
      notesGood++;
      goodInARow++;
    } else {
      goodInARow = 0;
      noteColor = "red";
      notesTotal++;
    }
  }

  function setAudio() {
    const AudioContext = window.AudioContext || window["webkitAudioContext"];
    audioContext = new AudioContext();
  }

  function playSweep(note: number): OscillatorNode {
    // console.log(note);
    const osc = audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.value = MidiUtils.noteToFreq(note);
    const amp = audioContext.createGain();
    amp.gain.setValueAtTime(1, audioContext.currentTime);
    amp.connect(audioContext.destination);
    osc.connect(audioContext.destination);
    osc.start(0);
    return osc;
  }

  function start() {
    started = true;
    nextNote();
  }

  function stop() {
    guessedNote = undefined;
    guessedAccidental = undefined;
    notesTotal = 0;
    notesGood = 0;
    accuracy = 0;
    started = false;
    note = undefined;
    accidental = undefined;
  }
  function nextNote() {
    notesTotal++;
    noteColor = "black";
    note = notes[Math.floor(Math.random() * notes.length)];
    accidental = accidentals[Math.floor(Math.random() * accidentals.length)];
  }
</script>

<main>
  <div class="container-fluid">
    <div class="row">
      <div class="col-2">
        <div class="card mb-4">
          <div class="card-header">Clef</div>
          <ul class="list-group list-group-flush">
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              href="#"
              on:click={() => {
                currentClef = "treble";
              }}
              class:active={currentClef === "treble"}
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex w-100 justify-content-between">
                <h2 class="mb-0">𝄞</h2>
              </div>
            </a>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              href="#"
              on:click={() => {
                currentClef = "bass";
              }}
              class:active={currentClef === "bass"}
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex w-100 justify-content-between">
                <h2 class="mb-0">𝄢</h2>
              </div>
            </a>
          </ul>
        </div>
        <div class="card mb-4">
          <div class="card-header">Clef</div>
          <ul class="list-group list-group-flush">
            {#each midiInputs as input}
              <!-- svelte-ignore a11y-invalid-attribute -->
              <a
                href="#"
                on:click={() => {
                  currentInput = input[0];
                }}
                class:active={currentInput === input[0]}
                class="list-group-item list-group-item-action"
              >
                <div class="d-flex w-100 justify-content-between">
                  <p class="mb-0">{input[1].name}</p>
                </div>
                <small><code>{input[1].state}</code></small>
              </a>
            {/each}
          </ul>
        </div>
        <div class="form-check form-switch">
          <input
            bind:checked={audioOn}
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckDefault"
          />
          <label class="form-check-label" for="flexSwitchCheckDefault"
            >Play sound</label
          >
        </div>
      </div>
      <div class="col-10">
        <div class="score m-3 mx-5">
          <h5>Accuracy: {accuracyText}</h5>
        </div>
        <div class="text-center">
          <StaveDrawer
            {note}
            color={noteColor}
            {accidental}
            clef={currentClef}
            scaleX={2}
            scaleY={2}
          />
          <h3>{guessedNoteText}</h3>
          {#if currentInput !== "none_buttons"}
            <Keyboard
              on:kbKeyDown={(e) => keyDown(e.detail)}
              on:kbKeyUp={(e) => keyUp(e.detail)}
              {actives}
            />
          {:else}
            <div class="mb-4">
              <div class="mb-2">
                {#each noteNames as note}
                  <button
                    class="btn btn-outline-primary mx-1"
                    on:click={() => {
                      keyNote = note;
                    }}
                    class:active={keyNote === note}>{note}</button
                  >
                {/each}
              </div>
              <div>
                {#each ["[]", ...accidentals.slice(1)] as acc}
                  <button
                    class="mx-1 btn btn-outline-primary"
                    on:click={() => {
                      keyAccidental = acc;
                    }}
                    class:active={keyAccidental === acc}>{acc}</button
                  >
                {/each}
              </div>
            </div>
          {/if}
          {#if !started}
            <button
              v-if="!started"
              class="btn btn-primary btn-lg"
              on:click={() => start()}>Start</button
            >
          {:else}
            <button class="btn btn-secondary btn-lg" on:click={() => stop()}
              >Stop</button
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  .score {
    display: flex;
    justify-content: right;
  }
</style>
