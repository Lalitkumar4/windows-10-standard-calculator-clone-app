class Calculator {
  constructor(
    previousOperandTextElement,
    currentOperandTextElement,
    historyTextElement
  ) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.historyTextElement = historyTextElement;
    this.history = [];
    this.clear();
    this.initializeKeyboardInput();
  }

  // clear calculator values
  clear() {
    this.currentOperand = "0";
    this.previousOperand = "";
    this.operation = undefined;
    this.computationDone = false;
  }

  // add keyboard input functionality
  initializeKeyboardInput() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardInput(e.key);
      // prevent Tab key
      if (e.key === "Tab") {
        e.preventDefault();
      }
    });
  }

  handleKeyboardInput(key) {
    // disabled key instead of 0-9, backspace, escape and delete key when error message shows
    if (
      this.currentOperand === "Can't divide by 0" ||
      this.currentOperand === "Invalid input" ||
      this.currentOperand === "Infinity"
    ) {
      // enable only specific keys
      if (
        /[0-9]|Escape|Backspace|Delete|Enter|=/.test(key) ||
        (key === "Delete" && this.currentOperand !== "")
      ) {
        if (key === "Delete" || key === "Backspace") {
          this.clear();
          this.computationDone = false;
        } else if (key === "Escape") {
          this.clear();
          this.computationDone = false;
        } else if (key === "=" || key === "Enter") {
          this.compute();
          this.clear();
          this.computationDone = true;
        } else {
          this.previousOperand = "";
          this.operation = undefined;
          this.appendNumber(key);
        }
        this.updateDisplay();
      }
      return;
    }
    //prevent function keys
    if (/^F[1-9]|F1[0-2]$/.test(key)) {
      return;
    }
    if (/[0-9.]/.test(key)) {
      if (this.computationDone) {
        // if computation is done, start a new input
        this.currentOperand = "";
        this.computationDone = false;
      }
      this.appendNumber(key);
      this.updateDisplay();
    } else if (/[+\-*/]/.test(key)) {
      this.chooseOperation(key);
      this.updateDisplay();
      this.computationDone = false;
    } else if (key === "%" || (key === "5" && key === "Shift")) {
      this.chooseOperation(key);
      this.updateDisplay();
      this.computationDone = false;
    } else if (key === "=" || key === "Enter") {
      this.compute();
      this.updateDisplay();
      this.computationDone = true;
    } else if (key === "Backspace") {
      this.delete();
      this.updateDisplay();
      this.computationDone = false;
    } else if (key === "Escape" || key === "Delete") {
      this.clear();
      this.updateDisplay();
      this.computationDone = false;
    } else if (key === "h" || key === "H") {
      //history button toggle
      this.historyTextElement.classList.toggle("show");
      document.querySelector(".output").classList.toggle("disabled");
    }
  }

  // delete the last character from the current operand
  delete() {
    if (
      this.currentOperand === "Can't divide by 0" ||
      this.currentOperand === "Invalid input" ||
      this.currentOperand === "Infinity"
    ) {
      this.clear();
    }

    this.currentOperand = this.currentOperand.toString().slice(0, -1);
    //check if the current operand is empty after deleting all number using delete
    if (this.currentOperand === "") {
      this.currentOperand = "0"; //display '0' when current operand is empty
    }
  }

  // append a number to the current operand
  appendNumber(number) {
    if (number === "." && this.currentOperand.includes(".")) return;

    if (number === "+/-") {
      if (this.currentOperand !== "0") {
        if (this.currentOperand.startsWith("-")) {
          this.currentOperand = this.currentOperand.slice(1);
        } else {
          this.currentOperand = "-" + this.currentOperand;
        }
      }
    } else {
      if (this.currentOperand === "0" || this.computationDone) {
        this.currentOperand = number.toString();
        this.computationDone = false;
      } else {
        if (this.currentOperand.length > 18) return; // Maximum 18 digits
        this.currentOperand =
          this.currentOperand.toString() + number.toString();
      }
    }
    // Check if the current operand starts with a decimal point and prepend "0" to it
    if (this.currentOperand.startsWith(".")) {
      this.currentOperand = "0" + this.currentOperand;
    }
  }

  chooseOperation(operation) {
    //changing the operator after the user has already input an operator

    if (this.currentOperand === "" && this.previousOperand !== "") {
      if (operation === "/") {
        this.operation = "÷";
      } else if (operation === "*") {
        this.operation = "×";
      } else {
        this.operation = operation;
      }
      this.updateDisplay();
      return;
    }

    if (this.currentOperand === "") return;
    if (this.previousOperand !== "") {
      this.compute();
    }
    if (operation === "/") {
      this.operation = "÷";
    } else if (operation === "*") {
      this.operation = "×";
    } else {
      this.operation = operation;
    }
    this.previousOperand = this.currentOperand;
    this.currentOperand = "";
  }

  // Handle special operation
  handleSpecialOperation(operation) {
    const current = parseFloat(this.currentOperand);
    if (operation === "1/𝑥") {
      if (current === 0) {
        this.currentOperand = "Can't divide by 0";
      } else if (this.previousOperand === "0") {
        this.currentOperand = "Invalid input";
      } else {
        this.currentOperand = (1 / current).toString();
      }
    } else if (operation === "𝑥²") {
      if (this.previousOperand === "0") {
        this.currentOperand = "Invalid input";
      } else {
        this.currentOperand = (current ** 2).toString();
      }
    } else if (operation === "√𝑥") {
      if (current <= 0) {
        this.currentOperand = "Invalid input";
      } else if (this.previousOperand === "0") {
        this.currentOperand = "Invalid input";
      } else {
        this.currentOperand = Math.sqrt(current).toString();
      }
    }

    // Store the special operation in history
    const operand = this.getDisplayNumber(current);
    let specialChar;
    if (operation === "1/𝑥") {
      specialChar = `1/${operand}`;
    } else if (operation === "𝑥²") {
      specialChar = `${operand}²`;
    } else {
      specialChar = `√${operand}`;
    }
    const calculation = `${specialChar} = ${this.currentOperand}`;
    // Only push valid calculation results to history
    if (
      this.currentOperand !== "Invalid input" &&
      this.currentOperand !== "Can't divide by 0" &&
      this.currentOperand !== "Infinity"
    ) {
      this.history.push(calculation);
    }
  }

  // Perform computation based on the chosen operation
  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    switch (this.operation) {
      case "+":
        computation = prev + current;
        break;
      case "-":
        computation = prev - current;
        break;
      case "×":
        computation = prev * current;
        break;
      case "÷":
        if (current === 0) {
          computation = "Can't divide by 0";
        } else {
          computation = prev / current;
        }
        break;
      case "%":
        computation = (prev * current) / 100;
        break;
      default:
        return;
    }

    if (typeof computation === "number") {
      this.currentOperand = computation;
    } else {
      this.currentOperand = computation; // for error message
    }

    // Store the operation in history
    const calculation = `${this.getDisplayNumber(prev)} ${
      this.operation
    } ${this.getDisplayNumber(current)} = ${this.currentOperand}`;

    // not include invalid outout in history
    if (this.getDisplayNumber(current) == 0 && this.operation == "÷") {
      return;
    } else {
      this.history.push(calculation);
    }

    this.operation = undefined;
    this.previousOperand = "";
  }

  // Get the formatted number for display (,)
  getDisplayNumber(number) {
    const parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  // Update the calculator display
  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(
      this.currentOperand
    );

    // disabled specific button when error shows
    if (
      this.currentOperand === "Can't divide by 0" ||
      this.currentOperand === "Invalid input" ||
      this.currentOperand === "Infinity"
    ) {
      operationButtons.forEach((button) => {
        button.classList.add("disabled");
      });

      specialOperationButtons.forEach((button) => {
        button.classList.add("disabled");
      });
      positiveNegativeButton.classList.add("disabled");
    } else {
      operationButtons.forEach((button) => {
        button.classList.remove("disabled");
      });
      specialOperationButtons.forEach((button) => {
        button.classList.remove("disabled");
      });
      positiveNegativeButton.classList.remove("disabled");
    }

    // change font size to small
    if (this.currentOperandTextElement.innerText.length > 15) {
      this.currentOperandTextElement.style.fontSize = "2.4rem";
    } else {
      // reset font size
      this.currentOperandTextElement.style.fontSize = "";
    }

    if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(
        this.previousOperand
      )} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = "";
    }

    //display the history of calculations
    if (this.history.length > 0) {
      this.historyTextElement.innerText = this.history.join("\n");
    } else {
      this.historyTextElement.innerText = "There's no history yet";
    }
  }
}

const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const equalsButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector("[data-delete]");
const allClearButton = document.querySelector("[data-all-clear]");
const previousOperandTextElement = document.querySelector(
  "[data-previous-operand]"
);
const currentOperandTextElement = document.querySelector(
  "[data-current-operand]"
);
const specialOperationButtons = document.querySelectorAll(
  "[data-specialoperation]"
);
const positiveNegativeButton = document.querySelector(
  "[data-positivenegative]"
);
const historyTextElement = document.querySelector("[data-history]");
const historyIconElement = document.querySelector("#history-icon .icon");

const calculator = new Calculator(
  previousOperandTextElement,
  currentOperandTextElement,
  historyTextElement
);

// Event listeners for button clicks
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (calculator.computationDone) {
      calculator.currentOperand = "";
      calculator.computationDone = false;
    }
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    calculator.chooseOperation(button.innerText);
    calculator.updateDisplay();
  });
});

equalsButton.addEventListener("click", () => {
  if (
    calculator.currentOperand === "Can't divide by 0" ||
    calculator.currentOperand === "Invalid input" ||
    calculator.currentOperand === "Infinity"
  ) {
    calculator.clear();
  }

  calculator.computationDone = true;
  calculator.compute();
  calculator.updateDisplay();
});

allClearButton.addEventListener("click", () => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener("click", () => {
  calculator.delete();
  calculator.updateDisplay();
});

specialOperationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    calculator.handleSpecialOperation(button.innerText);
    calculator.updateDisplay();
    calculator.computationDone = true;
  });
});

positiveNegativeButton.addEventListener("click", () => {
  calculator.appendNumber(positiveNegativeButton.innerText);
  calculator.updateDisplay();
});

// history toggle
historyIconElement.addEventListener("click", (e) => {
  e.stopPropagation();
  historyTextElement.classList.toggle("show");
  //show message when click on history icon
  calculator.updateDisplay();
  document.querySelector(".output").classList.add("disabled");
});

window.addEventListener("click", (e) => {
  if (e.target !== historyTextElement) {
    historyTextElement.classList.remove("show");
    document.querySelector(".output").classList.remove("disabled");
  }
});
