let inputStates = document.querySelector("#allStates");
let inputStartState = document.querySelector("#startState");
let inputAlphabets = document.querySelector("#alphabets");
let inputAcceptState = document.querySelector("#acceptState");

const resetBtn = document.querySelector("#resetBtn");
const addTransition = document.querySelector("#addTransition");
const visualize = document.querySelector("#visualization");

var allState = {};
var alphabet = {};
var startState = [];
var accepteState = {};
var allTransition = {}; // this allTransition for use test string
var Transition = {}; // this for use to check DFA or not
var duplicateValue = [];
var fa = {};

//----------- for convert from string to array if have ","
function stringToList(str) {
  str = str.replaceAll(" ", "");
  str = str.trim();
  return str.split(",");
}

//-------------- get input for FA
function getInput() {
  allState = stringToList(inputStates.value);
  let alphabetop = inputAlphabets.value + ",op"; // alphabet + "op" that op equal to ∈ transition
  alphabet = stringToList(alphabetop);
  startState = stringToList(inputStartState.value);
  accepteState = stringToList(inputAcceptState.value);

  console.log(allState);
  console.log(alphabet);
}

//-------------- get all State and alphabet for create table transition
function makeTransition() {
  let outTransition = document.querySelector("#transitions");
  text = `<div class="classTransition">FA Transition</div>
      <table >
      <tr>`;
  for (let x = 0; x <= alphabet.length; x++) {
    if (x == 0) {
      text = text + `<th>State</th>`;
    } else {
      if (x == alphabet.length) {
        text = text + `<th>&#8712;</th>`;
      } else {
        text = text + `<th>${alphabet[x - 1]}</th>`;
      }
    }
  }

  for (let i = 0; i <= allState.length; i++) {
    if (i != 0) {
      text = text + `</tr><tr>`;
      text = text + `<th>${allState[i - 1]}</th>`;
      for (let j = 0; j <= alphabet.length; j++) {
        if (j != 0) {
          text =
            text +
            `<td><input type="text" id="${
              allState[i - 1] + alphabet[j - 1]
            }"></td>`;
        }
      }
    }
  }
  outTransition.innerHTML = text + `</tr></table>`;
}

//----------------------- get value in table to store in variable transition as opject of array
function visulize() {
  getInput();
  for (let i = 0; i < allState.length; i++) {
    var str = "";
    str = allState[i];
    let inputobj1 = {};
    let inputobj2 = {};
    for (let j = 0; j < alphabet.length; j++) {
      let getValue = "";
      getValue = allState[i] + alphabet[j];
      let temp = document.getElementById(getValue);

      // check get value use all part expect function check FA
      if (temp.value != "") {
        // check if it is not input value is not record
        let x = { [alphabet[j]]: stringToList(temp.value) };
        inputobj1 = { ...inputobj1, ...x };
      }

      // get value for use in function check FA
      let t = { [alphabet[j]]: stringToList(temp.value) };
      inputobj2 = { ...inputobj2, ...t };
    }
    allTransition[[str]] = inputobj1; // using for all part expect check FA
    Transition[[str]] = inputobj2; // using for only function check FA
  }
  console.log(allState);
  console.log(startState);
  console.log(accepteState);
  console.log(alphabet);
  console.log(allTransition);

  let symbol = alphabet.slice(0, -1);
  console.log("symbol: " + symbol);
  console.log("alphabet: "+ alphabet);

  fa = {
    states : allState,
    alphabet: symbol,
    startState:startState[0],
    acceptStates: accepteState,
    transitions: allTransition
  }
  console.log(fa);
  // const Check = isDFA();
  // console.log(Check);
}

//------------------- Function for FA is DFA or not DFA->(NFA)
function isDFA() {
  for (let j = 0; j < allState.length; j++) {
    let transitions = Transition[allState[j]];
    console.log("transition: " + allState[j]);
    let symbols = Object.keys(transitions);

    // Check if multiple transitions exist for any symbol
    for (let i = 0; i < symbols.length; i++) {
      if (Array.isArray(transitions[symbols[i]])) {
        if (transitions[symbols[i]].length > 1) return false;
      }
      console.log("symbols length: " + symbols.length);
      if (i == symbols.length - 1) {
        console.log(transitions[symbols[i]] + "==" + allState[j]);

        // ----- if ∈ transition is null set it equal to transition to ownself
        if (transitions[symbols[i]] == "") {
          transitions[symbols[i]] = allState[j];
        }
        // ----- if ∈ transition to other is return false (mean it is not DFA)
        if (transitions[symbols[i]] != allState[j]) return false;
      } else {
        if (transitions[symbols[i]] == "") return false;
      }
    }
  }
  return true;
}

//----------- test DFA of String
function isAcceptedDFA(input) {
  let currentState = startState;

  for (let i = 0; i < input.length; i++) {
    let string = input.charAt(i);

    if (!allTransition[currentState][string]) {
      return false; // No transition defined for the current state and symbol
    }
    currentState = allTransition[currentState][string];
  }

  for (let i = 0; i < accepteState.length; i++) {
    if (accepteState[i].includes(currentState)) {
      return true;
    }
  }
  return false;
}

//------------ test NFA accept string or not
function isAcceptedNFA(input) {
  let currentStates = getEpsilonClosure([startState]);

  for (let i = 0; i < input.length; i++) {
    const string = input.charAt(i);
    const nextStates = [];

    for (const state of currentStates) {
      const transitions = allTransition[state][string] || [];

      for (const nextState of transitions) {
        nextStates.push(...getEpsilonClosure([nextState]));
      }
    }

    currentStates = nextStates;
  }

  return currentStates.some((state) => accepteState.includes(state));
}
//-------- create getEpsilonClosure for all char if have ∈ transition
function getEpsilonClosure(states) {
  const visited = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const currentState = stack.pop();
    //--------------- op stand for epsilon
    const epsilonTransitions = allTransition[currentState]["op"] || [];

    for (const nextState of epsilonTransitions) {
      if (!visited.has(nextState)) {
        visited.add(nextState);
        stack.push(nextState);
      }
    }
  }
  return Array.from(visited);
}

var nfa = {};
var dfa = {};
document.getElementById("nfa2dfa").addEventListener("click", function () {
  let alphabets = alphabet;
  alphabets.pop();
  nfa = {
    states: allState,
    symbols: alphabets,
    transitions: allTransition,
    StartState: startState,
    AcceptStates: accepteState,
  };

  dfa = convertNFAToDFA(nfa);
  // console.log(dfa);
  // console.log(duplicateValue);
  outPutNFA(dfa);
});

function convertNFAToDFA(nfa) {
  const dfa = {
    states: [],
    symbols: nfa.symbols,
    transitions: {},
    startState: "",
    acceptStates: [],
  };

  const initialState = getEpsilon(nfa, nfa.StartState);
  const unmarkedStates = [initialState];

  dfa.states.push(initialState);

  while (unmarkedStates.length > 0) {
    const currentState = unmarkedStates.shift();
    const currentStateKey = currentState.join(",");

    if (currentStateKey === "") {
      // currentStateKey = "REJ";
      continue;
    }

    for (const symbol of dfa.symbols) {
      const nextStates = getNextStates(nfa, currentState, symbol);
      const epsilonClosure = getEpsilon(nfa, nextStates);
      const epsilonClosureKey = epsilonClosure.join(",");

      if (!dfa.states.includes(epsilonClosureKey)) {
        dfa.states.push(epsilonClosureKey);
        unmarkedStates.push(epsilonClosure);
      }

      dfa.transitions[currentStateKey] = dfa.transitions[currentStateKey] || {};
      dfa.transitions[currentStateKey][symbol] = epsilonClosureKey;
    }

    if (currentState.some((state) => nfa.AcceptStates.includes(state))) {
      dfa.acceptStates.push(currentStateKey);
    }
  }

  dfa.startState = initialState.join(",");
  dfa.states = dfa.states.slice(1); // drop array index 0
  dfa.acceptStates = removeDuplicate(dfa.acceptStates); // change value of #duplicateValue follow acceptStates
  console.log("Duplicate : "+duplicateValue);
  // change value of #duplicateValue again follow states that we need to remove duplicate value from transition
  dfa.states = removeDuplicate(dfa.states);

  // loop for remove duplicateValue transition
  for (let i = 0; i < duplicateValue.length; i++) {
    console.log("Duplicate : "+i+duplicateValue[i]);
    delete dfa.transitions[duplicateValue[i]];
  }


  if(!dfa.states.includes(dfa.startState)){
    dfa.states.push(dfa.startState);
  }

  // add state Reject if have
  for (let s = 0; s < dfa.states.length; s++) {
    if (dfa.states[s] == "") {
      dfa.states[s] = "REJ";
      let reject = {};
      for (let symbol of dfa.symbols) {
        let t = { [symbol]: "REJ" };
        reject = { ...t, ...reject };
      }
      dfa.transitions["REJ"] = reject;
    }

    // Check in transition if transition to null it will show reject
    for (let symbol1 of dfa.symbols) {
      if (dfa.transitions[dfa.states[s]][symbol1] == "") {
        dfa.transitions[dfa.states[s]][symbol1] = "REJ";
      }
    }
  }

  return dfa;
}
// Rest of the code remains the same

function getEpsilon(nfa, states) {
  // for convert NFA to DFA
  const epsilonClosure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const currentState = stack.pop();

    if (nfa.transitions[currentState] && nfa.transitions[currentState]["op"]) {
      const nextStates = nfa.transitions[currentState]["op"];

      for (const nextState of nextStates) {
        if (!epsilonClosure.has(nextState)) {
          epsilonClosure.add(nextState);
          stack.push(nextState);
        }
      }
    }
  }

  return Array.from(epsilonClosure);
}

function getNextStates(nfa, states, symbol) {
  const nextStates = [];

  for (const state of states) {
    if (nfa.transitions[state] && nfa.transitions[state][symbol]) {
      nextStates.push(...nfa.transitions[state][symbol]);
    }
  }

  return nextStates;
}

function findDuplicate(states) {
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      if (areSetsEqual(states[i].split(","), states[j].split(","))) {
        duplicateValue.push(states[j]);
        return j; // Return index of the duplicate element
      }
    }
  }
  return -1; // No duplicate found
}

function areSetsEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  for (let elem of set1) {
    if (!set2.has(elem)) {
      return false;
    }
  }

  return true;
}

function removeDuplicate(states) {
  duplicateValue = [];
  const duplicateIndex = findDuplicate(states);
  if (states.length != 1) {
    if (duplicateIndex !== -1) {
      states.splice(duplicateIndex, 1); // Remove duplicate element
    }
  }
  return states;
}

// this function for call output dfa that convert from nfa
// to display on web page by table
function outPutNFA(dfa) {
  console.log(dfa);
  let output = document.getElementById("outputDFAConvert");
  let text = `
      <table >
      <tr>`;
  // for show only all alphabet (symbol) to the table
  for (let x = 0; x <= dfa.symbols.length; x++) {
    if (x == 0) {
      text = text + `<th>State</th>`;
    } else {
      text = text + `<th>${dfa.symbols[x - 1]}</th>`;
    }
  }

  // for all states and value to the table
  for (let i = 0; i <= dfa.states.length; i++) {
    if (i != 0) {
      let Transitions_state = dfa.transitions[dfa.states[i - 1]];
      text = text + `</tr><tr>`;
      if (dfa.startState == dfa.states[i - 1]) {
        // test if it start states
        if (dfa.acceptStates.includes(dfa.states)) {
          // test if it start and accept state will show  👉{state}*
          text = text + `<th>👉${dfa.states[i - 1]}*</th>`;
        } else {
          text = text + `<th>👉${dfa.states[i - 1]}</th>`;
        }
      } else {
        if (dfa.acceptStates.includes(dfa.states[i - 1])) {
          // print star for accept states
          text = text + `<th>${dfa.states[i - 1]}*</th>`;
        } else {
          text = text + `<th>${dfa.states[i - 1]}</th>`;
        }
      }
      for (let j = 0; j <= dfa.symbols.length; j++) {
        if (j != 0) {
          text = text + `<td>${Transitions_state[dfa.symbols[j - 1]]}</td>`;
        }
      }
    }
  }
  output.innerHTML = text + `</tr></table>`;
}


function minimizeDFA(fa) {
  // Step 1: Initialize the partitions
  let partitions = [fa.acceptStates, difference(fa.states, fa.acceptStates)];

  // Step 1.5: Remove unreachable states
  let reachableStates = getReachableStates(fa);
  partitions = partitions.map((partition) =>
    partition.filter((state) => reachableStates.includes(state))
  );

  while (true) {
    let newPartitions = [];
    let changed = false;

    // Step 2: Iterate over the partitions and split if necessary
    for (let partition of partitions) {
      let subPartitions = splitPartition(partition, fa.alphabet, partitions);
      if (subPartitions.length > 1) {
        newPartitions.push(...subPartitions);
        changed = true;
      } else {
        newPartitions.push(partition);
      }
    }

    if (!changed) {
      // Step 4: Stop if no change in partition occurs
      break;
    }

    // Step 5: Update the partitions
    partitions = newPartitions;
  }

  // Merge overlapping states into a single state
  const mergedStates = partitions.map((partition) => partition.join(","));
  const uniqueStates = Array.from(new Set(mergedStates)); // Remove duplicates

  const mergedTransitions = {};

  for (let representativeState of uniqueStates) {
    mergedTransitions[representativeState] = {};

    for (let symbol of fa.alphabet) {
      const nextStates = new Set();
      for (let state of representativeState.split(",")) {
        const nextState = fa.transitions[state][symbol][0];
        const nextStatePartition = findPartition(nextState, partitions);
        const nextStateMergedState = nextStatePartition.join(",");
        nextStates.add(nextStateMergedState);
      }
      mergedTransitions[representativeState][symbol] = [...nextStates];
    }
  }

  // Construct the minimized fa using the merged states and transitions
  const minimizedfa = {
    states: uniqueStates,
    alphabet: fa.alphabet,
    transitions: mergedTransitions,
    startState: findPartition(fa.startState, partitions).join(","),
    acceptStates: partitions
      .filter((partition) =>
        partition.some((state) => fa.acceptStates.includes(state))
      )
      .map((partition) => partition.join(",")),
  };

  return minimizedfa;
}

// Helper function to find reachable states in the fa
function getReachableStates(fa) {
  const queue = [fa.startState];
  const visited = new Set([fa.startState]);

  while (queue.length > 0) {
    const currentState = queue.shift();

    for (let symbol of fa.alphabet) {
      const nextState = fa.transitions[currentState][symbol][0];
      if (!visited.has(nextState)) {
        visited.add(nextState);
        queue.push(nextState);
      }
    }
  }

  return Array.from(visited);
}

// Helper function to find the difference between two arrays
function difference(array1, array2) {
  return array1.filter((item) => !array2.includes(item));
}

// Helper function to split a partition based on the input symbols
function splitPartition(partition, alphabet, partitions) {
  const result = [];

  for (let symbol of alphabet) {
    const transitions = new Map();

    for (let state of partition) {
      const nextState = fa.transitions[state][symbol][0];
      const nextStatePartition = findPartition(nextState, partitions);

      if (!transitions.has(nextStatePartition)) {
        transitions.set(nextStatePartition, [state]);
      } else {
        transitions.get(nextStatePartition).push(state);
      }
    }

    if (transitions.size > 1) {
      result.push(...Array.from(transitions.values()));
    }
  }

  return result;
}

// Helper function to find the partition that contains a specific state
function findPartition(state, partitions) {
  return partitions.find((partition) => partition.includes(state));
}


 
// // const minimized = minimizeDFA(fa);
// // console.log(minimized);
// // Example usage

let btnMinimize = document.getElementById("Minimize");
function outPutMinimiz() {
  console.log("Minimize");
  console.log(fa);
  let minimize = minimizeDFA(fa);
  console.log(minimize);
  let output = document.getElementById("OutputMinimize");
  let text = `
      <table >
      <tr>`;
  // for show only all alphabet (symbol) to the table
  for (let x = 0; x <= minimize.alphabet.length; x++) {
    if (x == 0) {
      text = text + `<th>State</th>`;
    } else {
      text = text + `<th>${minimize.alphabet[x - 1]}</th>`;
    }
  }

  // for all states and value to the table
  for (let i = 0; i <= minimize.states.length; i++) {
    if (i != 0) {
      let Transitions_state = minimize.transitions[minimize.states[i - 1]];
      text = text + `</tr><tr>`;
      if (minimize.startState == minimize.states[i - 1]) {
        // test if it start states
        if (minimize.acceptStates.includes(minimize.states)) {
          // test if it start and accept state will show  👉{state}*
          text = text + `<th>👉${minimize.states[i - 1]}*</th>`;
        } else {
          text = text + `<th>👉${minimize.states[i - 1]}</th>`;
        }
      } else {
        if (minimize.acceptStates.includes(minimize.states[i - 1])) {
          // print star for accept states
          text = text + `<th>${minimize.states[i - 1]}*</th>`;
        } else {
          text = text + `<th>${minimize.states[i - 1]}</th>`;
        }
      }
      for (let j = 0; j <= minimize.alphabet.length; j++) {
        if (j != 0) {
          text = text + `<td>${Transitions_state[minimize.alphabet[j - 1]]}</td>`;
        }
      }
    }
  }
  output.innerHTML = text + `</tr></table>`;
}
btnMinimize.addEventListener("click", function () {
  
  outPutMinimiz();
});


//------------- make action

resetBtn.addEventListener("click", function () {
  inputStates.value = "";
  inputStartState.value = "";
  inputAlphabets.value = "";
  inputAcceptState.value = "";
  document.querySelector("#transitions").innerHTML = "";
  document.getElementById("typeFA").innerHTML = "N/A";
});

addTransition.addEventListener("click", function () {
  getInput();
  makeTransition();
});

visualize.addEventListener("click", function () {
  visulize();
  if (isDFA()) {
    document.getElementById("typeFA").innerHTML = "DFA";
  } else {
    document.getElementById("typeFA").innerHTML = "NFA";
  }
});

let checkString = document.getElementById("inputString");
document.getElementById("forTest").addEventListener("click", function () {
  // visulize();
  let isDfa = true;
  if (isDFA()) {
    isDfa = isAcceptedDFA(checkString.value);
    document.getElementById("test1").innerHTML = "Test String (DFA)";
  } else {
    isDfa = isAcceptedNFA(checkString.value);
    document.getElementById("test1").innerHTML = "Test String (NFA)";
  }

  if (isDfa) {
    document.getElementById("result").innerHTML = "Accepted..";
    document.getElementById("result").style.color = "green";
  } else {
    document.getElementById("result").innerHTML = "Rejected!!";
    document.getElementById("result").style.color = "red";
  }
});
