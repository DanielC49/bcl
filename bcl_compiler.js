const version = "v_1.0.0_build";
let memory = {}, sel = "";
let feedback = true;

function compile(code) {

  let lines = code.replace(/\&nbsp;/g, " ").split("<br>");
  lines = lines.filter(e => e != "");

  let i, tmp = [], last = 0;

  for (i = 0; i < lines.length; i++) {
    while(lines[i].startsWith(" ")) lines[i] = lines[i].substr(1);
    for (k = 0; k < lines[i].length; k++) {
      if (lines[i].substr(k, 1) == " " && lines[i].substr(k - 1, 1) != " ") {
        tmp.push(lines[i].substring(last, k));
        last = k + 1;
      }
    }
    tmp.push(lines[i].substr(last, k));
    last = 0;
    lines[i] = tmp;
    tmp = [];
    //lines[i] = lines[i].includes(" ") ? [lines[i].substr(0, lines[i].search(" ")), lines[i].substr(lines[i].search(" ") + 1)] : [lines[i]];
  }

  console.log(lines);

  print(lines.map(e => e.join(" ").replace(/\s/g, "&nbsp;")).join("\n"), "log", "USER");

  print("&nbsp;");

  let stack = 0;

  for (i = 0; i < lines.length; i++) {

    stack++;

    if (stack > 50) {
      print("stack overflow", "error", "SYSTEM");
      break;
    }

    if (lines[i][0] == "help") { // store string
      print(`BCL COMMANDS
      help - get list of commands
      info - prints the startup message
      ver - prints the BCL Compiler version
      feedback - enables or disables feedback
      backcolor - changes console background color
      clear - clear console
      str - store string
      num - store number
      sel - select from memory
      set - set selector
      add - add the value of the selector to a given number
      sub - subtract the value of the selector by a given number
      mul - multiply the value of the selector by a given number
      div - divide the value of the selector by a given number
      append - append text to the value of the selector
      print - print
      mem - prints all memory entries
      goto - jump to a given line

      SYNTAX
      $ - read variable
      & - read contant

      BCL CONSTANTS
      date_day - day of month
      date_month - month number
      date_year - year
      date_weekday - day of week
      time_hours - hours
      time_minutes - minutes
      time_seconds - seconds`);
    } else if (lines[i][0] == "clear") {
      clearConsole();
    } else if (lines[i][0] == "info") {
      print("Welcome to BCL language. Type 'help' to get a list of possible commands.");
    } else if (lines[i][0] == "ver") {
      print("bcl_compiler_v_1.0.0");
    } else if (lines[i][0] == "feedback") {
      if (lines[i][1] == "on") {
        feedback = true;
        print("enabled feedback");
      } else if (lines[i][1] == "off") {
        feedback = false;
        print("disabled feedback");
      }
    } else if (lines[i][0] == "backcolor") {
      $("body").css("background-color", lines[i][1]);
      if (feedback) print("backcolor changed to " + lines[i][1]);

    } else if (lines[i][0] == "str") { // store string
      memory[lines[i][1]] = { type: "string", value: (lines[i].length > 2 ? lines[i].slice(2).join(" ") : "") };
      if (feedback) print("initialized string " + lines[i][1] + " with value '" + memory[lines[i][1]].value  + "'");

    } else if (lines[i][0] == "num") { // store number
      memory[lines[i][1]] = { type: "number", value: (lines[i].length > 2 ? Number(lines[i].slice(2)) : 0) };
      if (feedback) print("initialized number " + lines[i][1] + " with value " + memory[lines[i][1]].value);

    } else if (lines[i][0] == "sel") {
      if (memory[lines[i][1]] == undefined){
        print("variable " + lines[i][1] + " not found", "error");
        break;
      } else {
        sel = lines[i][1];
        if (feedback) print("changed selector to " + lines[i][1]);
      }
    } else if (lines[i][0] == "set") {
      if (sel == "") {
        print("no selector set", "error");
        break;
      } else {
        memory[sel].value = memory[sel].type == "number" ? Number(evalExp(lines[i][1]), true) : String(evalExp(lines[i][1]), true);
        if (feedback) print("set selector value to " + (memory[sel].type == "number" ? Number(evalExp(lines[i][1]), true) : String(evalExp(lines[i][1]), true)));
      }
    } else if (lines[i][0] == "add") {
      if (sel == "") {
        print("no selector set", "error");
        break;
      } else {
        memory[sel].value += Number(evalExp(lines[i][1]), true);
        if (feedback) print("added " + Number(evalExp(lines[i][1]), true) + " to " + sel + " value");
      }
    } else if (lines[i][0] == "sub") {
      if (sel == "") {
        print("no selector set", "error");
        break;
      } else {
        memory[sel].value -= Number(evalExp(lines[i][1]), true);
        if (feedback) print("subtracted " + Number(evalExp(lines[i][1]), true) + " by " + sel + " value");
      }
    } else if (lines[i][0] == "mul") {
      if (sel == "") {
        print("no selector set", "error");
        break;
      } else {
        memory[sel].value *= Number(evalExp(lines[i][1]), true);
        if (feedback) print("multiplied " + sel + " value by " + Number(evalExp(lines[i][1]), true));
      }
    } else if (lines[i][0] == "div") {
      if (sel == "") {
        print("no selector set", "error");
        break;
      } else {
        memory[sel].value /= Number(evalExp(lines[i][1]), true);
        if (feedback) print("divided " + sel + " value by " + Number(evalExp(lines[i][1]), true));
      }
    } else if (lines[i][0] == "append") {
      if (sel == "") {
        print("no selector found", "error");
        break;
      } else {
        memory[sel].value += String(evalExp(lines[i][1]));
        if (feedback) print("appended " + String(evalExp(lines[i][1])) + " to " + sel);
      }
    } else if (lines[i][0] == "print") {
      print(String(evalExp(lines[i][1])));
    } else if (lines[i][0] == "mem") {
      print("MEMORY");
      for (let j = 0; j < Object.keys(memory).length; j++) {
        print(Object.keys(memory)[j] + "=" + Object.values(memory)[j].value);
      }
    } else if (lines[i][0] == "goto") {
      if (feedback) print("jumping to line " + lines[i][1]);
      i = lines[i][1] - 2;
    } else if (lines[i][0] == "end") {
      if (feedback) print("code execution ended");
      break;
    } else if (lines[i][0].substr(0, 1) == "?") {
      if (sel == "") {
        print("no selector found", "error");
        break;
      } else {
        console.log(lines[i][0]);
        switch (lines[i][0].substr(1)) {
          case "=": if (!(memory[sel].value == lines[i][1])) i++;
          break;
          case "&lt;": if (!(memory[sel].value < lines[i][1])) i++;
          break;
          case "&gt;": if (!(memory[sel].value > lines[i][1])) i++;
          break;
          case "&lt;=": if (!(memory[sel].value <= lines[i][1])) i++;
          break;
          case "&gt;=": if (!(memory[sel].value >= lines[i][1])) i++;
          break;
        }
      }
    } else {
      print("Unknown command '" + lines[i][0] + "'. Type 'help' to get a list of possible commands.", "error");
      break;
    }

    //console.log(lines);

    //return { "code": cmds.join(" "), "result": res, "type": resType };

  }

  print("&nbsp;");

}

function evalExp(exp, number = false) {
  if (exp.substr(0, 1) == "$") {
    return memory[exp.substr(1)].value;
  } else if (exp.substr(0, 1) == "&") {
    switch (exp.substr(1)) {
      case "date_day": return new Date().getDate();
        break;
      case "date_month": return new Date().getMonth() + 1;
        break;
      case "date_year": return new Date().getFullYear();
        break;
      case "date_weekday": return new Date().getDay();
        break;
      case "time_hours": return new Date().getHours();
        break;
      case "time_minutes": return new Date().getMinutes();
        break;
      case "time_seconds": return new Date().getSeconds();
        break;
      default: return number ? 0 : "";
    }
  } else if (exp.substr(0, 1) == "%") {
    if (exp.startsWith("%len:")) {
      return String(memory[exp.substr(4)].value).length;
    } else if (exp.startsWith("%len:")) {
      return String(memory[exp.substr(4)].value).length;
    }
  } else {
    return number ? Number(exp) : exp;
  }
}
