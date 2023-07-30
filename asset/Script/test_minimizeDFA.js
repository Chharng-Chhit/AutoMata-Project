function minimizeDFA(dfa) {
  // Step 1: Initialize the partitions
  let partitions = [dfa.acceptStates, difference(dfa.states, dfa.acceptStates)];

  // Step 1.5: Remove unreachable states
  let reachableStates = getReachableStates(dfa);
  partitions = partitions.map((partition) =>
    partition.filter((state) => reachableStates.includes(state))
  );

  while (true) {
    let newPartitions = [];
    let changed = false;

    // Step 2: Iterate over the partitions and split if necessary
    for (let partition of partitions) {
      let subPartitions = splitPartition(partition, dfa.alphabet, partitions);
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

    for (let symbol of dfa.alphabet) {
      const nextStates = new Set();
      for (let state of representativeState.split(",")) {
        const nextState = dfa.transitions[state][symbol][0];
        const nextStatePartition = findPartition(nextState, partitions);
        const nextStateMergedState = nextStatePartition.join(",");
        nextStates.add(nextStateMergedState);
      }
      mergedTransitions[representativeState][symbol] = [...nextStates];
    }
  }

  // Construct the minimized DFA using the merged states and transitions
  const minimizedDFA = {
    states: uniqueStates,
    alphabet: dfa.alphabet,
    transitions: mergedTransitions,
    startState: findPartition(dfa.startState, partitions).join(","),
    acceptStates: partitions
      .filter((partition) =>
        partition.some((state) => dfa.acceptStates.includes(state))
      )
      .map((partition) => partition.join(",")),
  };

  return minimizedDFA;
}

// Helper function to find reachable states in the DFA
function getReachableStates(dfa) {
  const queue = [dfa.startState];
  const visited = new Set([dfa.startState]);

  while (queue.length > 0) {
    const currentState = queue.shift();

    for (let symbol of dfa.alphabet) {
      const nextState = dfa.transitions[currentState][symbol][0];
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
      const nextState = dfa.transitions[state][symbol][0];
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

// Example usage
const dfa = {
  states: ["q0", "q1", "q2", "q3", "q4", "q5"],
  alphabet: ["0", "1"],
  transitions: {
    q0: { 0: ["q3"], 1: ["q1"] },
    q1: { 0: ["q2"], 1: ["q5"] },
    q2: { 0: ["q2"], 1: ["q5"] },
    q3: { 0: ["q0"], 1: ["q4"] },
    q4: { 0: ["q2"], 1: ["q5"] },
    q5: { 0: ["q5"], 1: ["q5"] },
  },
  startState: "q0",
  acceptStates: ["q1", "q2", "q4"],
};

const minimizedDFA = minimizeDFA(dfa);
console.log(minimizedDFA);

let btn = document.getElementById("btn");
function outPutMinimiz() {
  console.log(dfa);
  let minimize = minimizeDFA(dfa);
  console.log(minimize);
  let output = document.getElementById("output");
  let text = `<div class="classTransition">DFA Output</div>
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
btn.addEventListener("click", function () {
  outPutMinimiz();
});
