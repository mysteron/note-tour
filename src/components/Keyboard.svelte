<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let actives: number[] = [];
  export let startIndex: number = 48;

  const dispatch = createEventDispatcher();

  const keyClasses = [
    "white c",
    "black cis",
    "white d",
    "black dis",
    "white e",
    "white f",
    "black fis",
    "white g",
    "black gis",
    "white a",
    "black ais",
    "white h",
    "white c",
    "black cis",
    "white d",
    "black dis",
    "white e",
    "white f",
    "black fis",
    "white g",
    "black gis",
    "white a",
    "black ais",
    "white h",
    "white c",
    "black cis",
    "white d",
    "black dis",
    "white e",
  ];

  function keyDown(num) {
    console.log(num);
    dispatch("kbKeyDown", num);
  }
  function keyUp(num) {
    dispatch("kbKeyUp", num);
  }
</script>

<div>
  <ul class="set">
    {#each keyClasses as keyClass, index}
      <li
        class:active={actives.includes(startIndex + index)}
        class={keyClass}
        on:mousedown={() => keyDown(index + startIndex)}
        on:mousedown={() => keyDown(index + startIndex)}
        on:mouseup={() => keyUp(index + startIndex)}
        on:touchstart={() => keyDown(index + startIndex)}
        on:touchend={() => keyUp(index + startIndex)}
      />
    {/each}
  </ul>
</div>

<style>
  ul.set {
    height: 18.875em;
    width: 1190px;
    margin: 5em auto;
    padding: 3em 3em 0 3em;
    position: relative;
    border: 1px solid #160801;
    border-radius: 1em;
    background: linear-gradient(
      to bottom right,
      rgba(0, 0, 0, 0.9),
      rgba(0, 0, 0, 0.7)
    );
    box-shadow: 0 0 50px rgb(0 0 0 / 50%) inset,
      0 1px rgb(212 152 125 / 20%) inset, 0 5px 15px rgb(0 0 0 / 50%);
  }

  li {
    margin: 0;
    padding: 0;
    list-style: none;
    position: relative;
    float: left;
  }

  ul.set .white {
    height: 16em;
    width: 4em;
    z-index: 1;
    border-left: 1px solid #bbb;
    border-bottom: 1px solid #bbb;
    border-radius: 0 0 5px 5px;
    box-shadow: -1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 0 5px #ccc inset,
      0 0 3px rgba(0, 0, 0, 0.2);
    background: linear-gradient(to bottom, #eee 0%, #fff 100%);
  }

  ul.set .white:active,
  ul.set .white.active {
    border-top: 1px solid #777;
    border-left: 1px solid #999;
    border-bottom: 1px solid #999;
    box-shadow: 2px 0 3px rgba(0, 0, 0, 0.1) inset,
      -5px 5px 20px rgba(0, 0, 0, 0.2) inset, 0 0 3px rgba(0, 0, 0, 0.2);
    background: linear-gradient(to bottom, #fff 0%, #e9e9e9 100%);
  }

  .black {
    height: 10em;
    width: 2em;
    margin: 0 0 0 -1em;
    z-index: 2;
    border: 1px solid #000;
    border-radius: 0 0 3px 3px;
    box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
      0 -5px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 2px 4px rgba(0, 0, 0, 0.5);
    background: linear-gradient(45deg, #222 0%, #555 100%);
  }

  .black:active,
  .black.active {
    box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2) inset,
      0 -2px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 1px 2px rgba(0, 0, 0, 0.5);
    background: linear-gradient(to right, #444 0%, #222 100%);
  }

  .a,
  .a1,
  .g,
  .g1,
  .g1,
  .d,
  .d1,
  .h,
  .e,
  .c2 {
    margin: 0 0 0 -1em;
  }

  ul.set li:first-child {
    border-radius: 5px 0 5px 5px;
  }

  ul.set li:last-child {
    border-radius: 0 5px 5px 5px;
  }

  .set {
    margin: auto auto;
  }
</style>
