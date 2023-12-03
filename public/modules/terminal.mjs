import "/scripts/xterm/lib/xterm.js";

const newLineKey = "\r\n";
const backSpaceKey = "\b \b";

/**
 * Class representing a Web terminal for Todo List app.
 */
export class TodoTerminal {
  /**
   * @type {Terminal}
   * */
  #term = null;
  /**
   * @type {HTMLElement}
   */
  #el = null;
  /**
   * @type {string[]}
   */
  #lines = [];
  /**
   * @type {string}
   */
  #currLine = "";
  /**
   * @type {function(string):void}
   */
  #submitHandler = null;

  /**
   *
   * @param {string} elementId  - Element id to mount the terminal into
   */
  constructor(elementId) {
    this.#term = new Terminal({ convertEol: true, cursorBlink: true });
    this.#el = document.getElementById(elementId);

    this.#term.open(this.#el);

    this.#term.onKey(({ key, domEvent: ev }) => {
      this.#handleKey(key, ev);
    });

    // this.#term.on("paste", (data) => {
    //   this.#currLine += data;
    //   this.#term.write(data);
    // });
  }

  /**
   * @private
   * @param {string} key - keyboard input
   * @param {Event} ev - keyboardEvent
   */
  #handleKey(key, ev) {
    if (ev.keyCode === 13) {
      this.#lines.push(this.#currLine);
      this.write(newLineKey);
      if (this.#submitHandler && typeof this.#submitHandler === "function") {
        this.#submitHandler(this.#currLine);
      }
      this.#currLine = "";
    } else if (ev.keyCode === 8) {
      this.#currLine = this.#currLine.substring(0, this.#currLine.length - 1);
      this.#term.write(backSpaceKey);
    } else {
      this.#currLine += key;
      this.write(key);
    }
  }

  /**
   * @param {string} text  - text to write in terminal
   */
  write(text) {
    this.#term.write(text);
  }

  /**
   *
   * @param {function(string):void} submitHandler
   */
  onSubmit(submitHandler) {
    this.#submitHandler = submitHandler;
  }
}
