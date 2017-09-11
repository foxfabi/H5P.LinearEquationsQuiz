/**
 * Defines the H5P.LinearEquationsQuiz.QuestionsGenerator class
 */
H5P.LinearEquationsQuiz.QuestionsGenerator = (function (EquationType) {
  
  var unknown = ["x", "y", "z", "a", "b"];
  var Fraction = algebra.Fraction;
  var Expression = algebra.Expression;
  var Equation = algebra.Equation;
  
  // Helper functions
  function randomNum (max) {
    var min = -max;
    // Creates random number between -max and max:
    var num = Math.floor(Math.random()*(max-min+1)+min);
    if (num === 0) {
      num = randomNum (max);
    }
    return num;
  }

  /**
   * Questions generator classes
   * @method QuestionsGenerator
   * @constructor
   * @param  {H5P.LinearEquationsQuiz.EquationType}   type
   * @param  {boolean} useFractions
   * @param  {number}  maxValue
   * @param  {number}  maxQuestions
   *
   * new QuestionsGenerator(self.type, self.useFractions, self.maxValue, self.maxQuestions);
   */
  function QuestionsGenerator(type, useFractions, maxValue, maxQuestions) {
    var self = this;
    var questions = [];
    //console.log("Fractions:"+useFractions);
    //console.log("maxValue:"+maxValue);
    //console.log("maxQuestions:"+maxQuestions);

    /**
     * Generates equation type for a question
     * @method generateEquation
     * @param  {EquationType}  type of equation
     */
    function generateEquation(item, EquationType, useFractions) {
      var expr = undefined;
      var expr2 = undefined;
      var expr3 = undefined;
      var number = undefined;
      var equation = undefined;
      var solution = undefined;
      //console.log(EquationType);
      //console.log(useFractions);
      switch (EquationType) {
        case "basic":
          // [ 3x = 12 ]
          if (useFractions === true) {            
            number = new Fraction(1, randomNum(2*maxValue));
          } else {
            number = randomNum(maxValue);
          }
          expr = new Expression(item);         
          expr = expr.multiply(randomNum(maxValue)).multiply(randomNum(maxValue));
          //expr = expr.multiply(3);
          expr = expr.multiply(2);
          expr = expr.multiply(number);
          //expr = expr.simplify();
          equation = new Equation(expr, 3 + randomNum(3*maxValue));
          try {
            solution = equation.solveFor(item);
          } catch(err) {
            equation = generateEquation(item, EquationType, useFractions)
            solution = equation.solveFor(item);
          }          
          break;
        case "intermediate":
          // [ 4x - 3 = 13 ]
          var operations = ["+", "-", "*"];
          if (useFractions === true) {            
            number = new Fraction(3, randomNum(2*maxValue));
          } else {
            number = randomNum(maxValue);
          }
          expr = new Expression(item);         
          expr = randomOperation(operations, expr, maxValue);
          expr = expr.multiply(number);
          expr = randomOperation(operations, expr, maxValue);
          expr = randomOperation(operations, expr, maxValue);
          equation = new Equation(expr, 1 + randomNum(2*maxValue));
          try {
            solution = equation.solveFor(item);
          } catch(err) {
            equation = generateEquation(item, EquationType, useFractions)
            solution = equation.solveFor(item);
          }          
          break;
        case "advanced":
          // [ 5x + 3 = 3x + 15 ]
          var operations = ["+", "-"];
          expr = new Expression(item);
          if (useFractions === true) {            
            number = new Fraction(1, randomNum(2*maxValue));
          } else {
            number = randomNum(maxValue);
          }          
          expr = randomOperation(operations, expr, maxValue);
          expr = randomOperation(operations, expr, maxValue);
          expr = expr.add(1 + randomNum(maxValue));
          expr = expr.multiply(1 + randomNum(maxValue));
          expr = expr.multiply(number);

          expr2 = new Expression(item);
          expr2 = randomOperation(operations, expr, maxValue);
          expr2 = randomOperation(operations, expr, maxValue);
          expr2 = expr2.multiply(number);

          expr = expr.simplify();
          expr2 = expr2.simplify();
          equation = new Equation(algebra.parse(expr.toString()), algebra.parse(expr2.toString()));
          try {
            solution = equation.solveFor(item);
          } catch(err) {
            equation = generateEquation(item, EquationType, useFractions)
            solution = equation.solveFor(item);
          }          
          break;
      }
      //console.log(".......................");
      //console.log(equation.toString());
      //console.log(solution.toString());
      //console.log(".......................");
      if (solution.toString() === "0") {
        // rebuild
        equation = generateEquation(item, EquationType, useFractions);
      }
      if (solution.toString() === "1") {
        // rebuild
        equation = generateEquation(item, EquationType, useFractions);
      }
      return equation;
      
    }
    /**
     * Generates alternative for a question
     * @method generateAlternatives
     * @param  {Object}             question
     */
    function generateAlternatives(question, EquationType, useFractions, maxValue) {
      question.alternatives = [];
      var equation = undefined;
      // Generate 5 wrong ones:
      while (question.alternatives.length !== 5) {
        equation = generateEquation(question.variable, EquationType, useFractions)
        var alternative = equation.toString();
        var solution = equation.solveFor(question.variable).toString();
        
        // check if alternative is present already and is not the correct one
        if (solution !== question.correct && question.alternatives.indexOf(solution) === -1) {
          question.alternatives.push(solution);
        }
      }

      // Add correct one
      question.alternatives.push(question.correct);

      // Shuffle alternatives:
      question.alternatives = H5P.shuffleArray(question.alternatives);
    }
        
    // Do a random operation on equation
    function randomOperation(operations, expr, maxValue) {
      // get a random operation
      var operation = operations[Math.floor(Math.random() * operations.length)];
      var number = 0;
      number = 3 + randomNum(maxValue);
      switch (operation) {
        case "/":
          if (number > 0) {
            expr = expr.divide(number);
          }
          break;
        case "*":
          expr = expr.multiply(number);
          break;
        case "+":
          expr = expr.add(number);
          break;
        case "-":
          expr = expr.subtract(number);
          break;
      }
      return expr;
    }

    // Generate questions
    for (i=50; i>=0; i--) {
      for (j=i; j>=0; j--) {
        var item = unknown[Math.floor(Math.random()*unknown.length)];
        var equation = generateEquation(item, type, useFractions);
        var solution = equation.solveFor(item);
        //console.log(equation.toString());
        //console.log("---------------------------------");
        questions.push({
          variable: item,
          expression: equation.toString(),
          correct: solution.toString(),
          textual: equation.toString(),
        });
      }
    }
    // Let's shuffle
    questions = H5P.shuffleArray(questions);

    if (questions.length > maxQuestions) {
      questions = questions.slice(0, maxQuestions);
    }

    // Create alternatives
    for (var i = 0; i < questions.length; i++) {
      generateAlternatives(questions[i], type, useFractions, maxValue);
    }

    /**
     * Returns the questions including alternatives and textual representation
     * @public
     * @return {array}
     */
    self.get = function () {
      return questions;
    }
  }

  return QuestionsGenerator;
}(H5P.LinearEquationsQuiz.EquationType));