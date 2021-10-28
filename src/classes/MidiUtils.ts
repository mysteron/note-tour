import { Subject } from 'rxjs';
//export type NoteVal = 'c' | 'd' | 'e' | 'f' | 'g' | 'a' | 'h';

export const nonMidiInputs = ['none_keyboard', 'none_buttons'];

interface NoteInterface {
  note: string;
  accidental: 'b' | '#' | undefined;
}

interface MidiNote {
  note: number;
  velocity: number;
}

export class MidiUtils {

  private midiAccess: WebMidi.MIDIAccess;
  public Ready: Promise<WebMidi.MIDIAccess>;
  private _onKeyDown: Subject<MidiNote> = new Subject<MidiNote>();
  private _onKeyUp: Subject<MidiNote> = new Subject<MidiNote>();
  private _midiInputs: WebMidi.MIDIInputMap;
  private _currentMidiInput: WebMidi.MIDIInput;


  public get onKeyDown() {
    return this._onKeyDown;
  }

  public get onKeyUp() {
    return this._onKeyUp;
  }

  private resetListeners() {
    if (this._currentMidiInput) {
      this._currentMidiInput.onmidimessage = undefined;
    }
  }

  private setListeners() {
    this._onKeyDown = new Subject<MidiNote>();
    this._onKeyUp = new Subject<MidiNote>();
    this._currentMidiInput.onmidimessage = (e) => {
      if (e.data[0] === 144) {
        this._onKeyDown.next({
          note: e.data[1],
          velocity: e.data[2],
        });
      }
      if (e.data[0] === 128) {
        this._onKeyUp.next({
          note: e.data[1],
          velocity: e.data[2],
        });
      }
    }
  }

  public constructor() {

    this.Ready = new Promise((resolve, reject) => {
      if (this.midiAccess) {
        resolve(this.midiAccess);
      } else {
        window.navigator.requestMIDIAccess().then((access) => {
          this.midiAccess = access;
          this._midiInputs = this.midiAccess.inputs;
          resolve(this.midiAccess);
        }).catch(reject);
      }
    });
  }

  public setActiveInput(id: string) {
    this.resetListeners();
    if (!nonMidiInputs.includes(id)) {
      this._currentMidiInput = this._midiInputs.get(id);
      this.setListeners();
    }
  }

  public getActiveInput() {
    return this._currentMidiInput;
  }

  public getInputsMap() {
    return this._midiInputs;
  }

  public static noteToHalfTone(note: NoteInterface, noOctave = false) {
    let halfTones = 0;
    const letter = note.note.split("/")[0];
    const octave = parseInt(note.note.split("/")[1]);
    switch (letter.toLowerCase()) {
      case "c":
        halfTones = 0;
        break;
      case "d":
        halfTones = 2;
        break;
      case "e":
        halfTones = 4;
        break;
      case "f":
        halfTones = 5;
        break;
      case "g":
        halfTones = 7;
        break;
      case "a":
        halfTones = 9;
        break;
      case "h":
      case "b":
        halfTones = 11;
        break;
    }
    if (note.accidental === "#") {
      halfTones++;
    }
    if (note.accidental === "b") {
      halfTones--;
    }
    if (noOctave) {
      halfTones = halfTones % 12;
    } else {
      halfTones += 12 * octave;
    }
    return halfTones;
  };

  public static midiNoteToNote(midiNote) {
    const octave = Math.floor(midiNote / 12);
    const key = midiNote % 12;
    let note;
    let accidental;
    const sharp = Math.random() > 0.5;
    switch (key) {
      case 0:
        note = "C";
        break;
      case 1:
        note = sharp ? "C" : "D";
        accidental = sharp ? "#" : "b";
        break;
      case 2:
        note = "D";
        break;
      case 3:
        note = sharp ? "D" : "E";
        accidental = sharp ? "#" : "b";
        break;
      case 4:
        note = "E";
        break;
      case 5:
        note = "F";
        break;
      case 6:
        note = sharp ? "F" : "G";
        accidental = sharp ? "#" : "b";
        break;
      case 7:
        note = "G";
        break;
      case 8:
        note = sharp ? "G" : "A";
        accidental = sharp ? "#" : "b";
        break;
      case 9:
        note = "A";
        break;
      case 10:
        note = sharp ? "A" : "B";
        accidental = sharp ? "#" : "b";
        break;
      case 11:
        note = "B";
        break;
    }
    return {
      note: `${note}/${octave}`,
      accidental,
    };
  }

  public static noteToFreq(note: number): number {
    let a = 440;
    return (a / 32) * 2 ** ((note - 9) / 12);
  }
}