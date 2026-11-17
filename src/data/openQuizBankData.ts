// Auto-compiled from Useful Tools open-licensed datasets (CC BY-SA 4.0)
// Attribution: Open Quiz Commons (prahladyeri/open-quiz-commons) & OpenTriviaQA (uberspot/OpenTriviaQA)
import type { Question } from '../types';

export const OPEN_QUIZ_ATTRIBUTION = {
  license: 'CC BY-SA 4.0',
  sources: [
    'Open Quiz Commons (github.com/prahladyeri/open-quiz-commons)',
    'OpenTriviaQA Science & Technology (github.com/uberspot/OpenTriviaQA)',
  ],
};

export const OPEN_QUIZ_BANK: Question[] = [
  {
    "id": "oqc_python_1",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · ml basics] What is the primary difference between Supervised and Unsupervised Learning?",
    "options": [
      {
        "id": "A",
        "text": "Supervised learning requires more processing power",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Supervised learning uses labeled data; Unsupervised learning finds patterns in unlabeled data",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Unsupervised learning is only used for images",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Supervised learning cannot be used for regression",
        "isCorrect": false
      }
    ],
    "explanation": "Supervised learning involves training a model on a dataset where the answer (label) is already known. Unsupervised learning looks for hidden structures or clusters within data that has no labels.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "ml basics"
    ]
  },
  {
    "id": "oqc_python_2",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · ml basics] In Machine Learning, what is 'Overfitting'?",
    "options": [
      {
        "id": "A",
        "text": "When a model is too simple to learn the underlying trend",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "When a model learns the training data and its noise too well, performing poorly on new data",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "When the dataset is too large for the computer's memory",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "When the model's accuracy is 0%",
        "isCorrect": false
      }
    ],
    "explanation": "Overfitting happens when a model becomes too complex and 'memorizes' the training data, losing its ability to generalize to unseen examples.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "ml basics"
    ]
  },
  {
    "id": "oqc_python_3",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · ml basics] Which of these is a classic example of a 'Classification' problem?",
    "options": [
      {
        "id": "A",
        "text": "Predicting the price of a house based on square footage",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Grouping customers based on purchasing habits",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Determining if an email is 'Spam' or 'Not Spam'",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Predicting the temperature for tomorrow",
        "isCorrect": false
      }
    ],
    "explanation": "Classification is about predicting a discrete label or category. Predicting a continuous numerical value (like price or temperature) is called 'Regression'.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "ml basics"
    ]
  },
  {
    "id": "oqc_python_4",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · ml basics] What is the purpose of the 'Train/Test Split' technique?",
    "options": [
      {
        "id": "A",
        "text": "To make the training process faster",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "To evaluate the model's performance on unseen data to ensure it can generalize",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "To satisfy the requirements of the Python interpreter",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "To double the amount of data available",
        "isCorrect": false
      }
    ],
    "explanation": "By setting aside a portion of data (the test set) that the model never sees during training, we can objectively measure how it will perform in the real world.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "ml basics"
    ]
  },
  {
    "id": "oqc_python_5",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · model evaluation] What does 'Accuracy' measure in a classification model?",
    "options": [
      {
        "id": "A",
        "text": "The number of positive predictions made",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "The ratio of correctly predicted observations to the total observations",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "The speed at which the model makes a prediction",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "The difference between the highest and lowest scores",
        "isCorrect": false
      }
    ],
    "explanation": "Accuracy is the most intuitive performance measure, but it can be misleading if the dataset is imbalanced (e.g., 99% of cases are Class A).",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "model evaluation"
    ]
  },
  {
    "id": "oqc_python_6",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · model evaluation] In a medical test, what does 'Recall' (Sensitivity) represent?",
    "options": [
      {
        "id": "A",
        "text": "The ability of the model to find all the positive cases",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "The ability of the model to avoid false alarms",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "The total number of patients tested",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "The time it takes to get results",
        "isCorrect": false
      }
    ],
    "explanation": "Recall answers: 'Of all the people who actually had the disease, how many did we correctly identify?' High recall is critical when the cost of a False Negative is high.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "model evaluation"
    ]
  },
  {
    "id": "oqc_python_7",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · model evaluation] What is 'Precision'?",
    "options": [
      {
        "id": "A",
        "text": "The total number of correct predictions",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "The ratio of correctly predicted positive observations to the total predicted positives",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "The consistency of the model over time",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "The depth of the neural network",
        "isCorrect": false
      }
    ],
    "explanation": "Precision answers: 'Of all the people we labeled as having the disease, how many actually had it?' High precision is critical when the cost of a False Positive is high (e.g., spam filters).",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "model evaluation"
    ]
  },
  {
    "id": "oqc_python_8",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · model evaluation] What is the 'F1-Score'?",
    "options": [
      {
        "id": "A",
        "text": "The maximum accuracy a model can reach",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "The harmonic mean of Precision and Recall",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "The square root of the Mean Squared Error",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "The ratio of training data to testing data",
        "isCorrect": false
      }
    ],
    "explanation": "The F1-Score provides a balance between Precision and Recall. It is particularly useful when you have an uneven class distribution.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "model evaluation"
    ]
  },
  {
    "id": "oqc_python_9",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · neural networks] What is the primary function of an 'Activation Function' in a neural network?",
    "options": [
      {
        "id": "A",
        "text": "To normalize the input data",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "To introduce non-linearity, allowing the network to learn complex patterns",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "To act as a backup for the weights",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "To calculate the final error of the model",
        "isCorrect": false
      }
    ],
    "explanation": "Without non-linear activation functions (like ReLU or Sigmoid), a neural network would just be a giant linear regression model, no matter how many layers it has.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "neural networks"
    ]
  },
  {
    "id": "oqc_python_10",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · neural networks] Which algorithm is used to calculate the gradient of the loss function with respect to the weights in the network?",
    "options": [
      {
        "id": "A",
        "text": "Forward Propagation",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Backpropagation",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Binary Search",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Gradient Descent",
        "isCorrect": false
      }
    ],
    "explanation": "Backpropagation uses the chain rule from calculus to determine how much each weight contributed to the total error, moving backward from the output layer to the input.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "neural networks"
    ]
  },
  {
    "id": "oqc_python_11",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · neural networks] What is a 'Layer' in a Deep Neural Network composed of?",
    "options": [
      {
        "id": "A",
        "text": "A collection of individual neurons (perceptrons)",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "A single large computer processor",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "A list of Python strings",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "A database table",
        "isCorrect": false
      }
    ],
    "explanation": "Deep networks consist of an input layer, one or more 'hidden' layers, and an output layer, each containing nodes that process information.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "neural networks"
    ]
  },
  {
    "id": "oqc_python_12",
    "chapterId": "ch_open_python",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[PYTHON · neural networks] What does the 'Learning Rate' hyperparameter control?",
    "options": [
      {
        "id": "A",
        "text": "The speed at which data is read from the disk",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "The size of the steps taken during gradient descent to update weights",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "The number of neurons in the hidden layer",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "The total number of epochs the model runs",
        "isCorrect": false
      }
    ],
    "explanation": "If the learning rate is too high, the model might overshoot the minimum error; if it is too low, the training will be extremely slow or get stuck.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (PYTHON)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "python",
      "neural networks"
    ]
  },
  {
    "id": "oqc_javascript_13",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · design patterns] Which design pattern ensures only one instance of a class is created?",
    "options": [
      {
        "id": "A",
        "text": "Factory Pattern",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Singleton Pattern",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Observer Pattern",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Decorator Pattern",
        "isCorrect": false
      }
    ],
    "explanation": "The Singleton Pattern restricts instantiation so only one instance of a class exists.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "design patterns"
    ]
  },
  {
    "id": "oqc_javascript_14",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · design patterns] Which design pattern provides a way to create objects without specifying the exact class?",
    "options": [
      {
        "id": "A",
        "text": "Factory Pattern",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "Singleton Pattern",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Observer Pattern",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Prototype Pattern",
        "isCorrect": false
      }
    ],
    "explanation": "The Factory Pattern abstracts object creation, allowing flexibility in instantiation.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "design patterns"
    ]
  },
  {
    "id": "oqc_javascript_15",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · design patterns] Which design pattern allows objects to be notified when another object changes state?",
    "options": [
      {
        "id": "A",
        "text": "Decorator Pattern",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Observer Pattern",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Factory Pattern",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Adapter Pattern",
        "isCorrect": false
      }
    ],
    "explanation": "The Observer Pattern establishes a one-to-many dependency so observers are updated automatically.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "design patterns"
    ]
  },
  {
    "id": "oqc_javascript_16",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · design patterns] Which design pattern lets you add new behavior to objects dynamically?",
    "options": [
      {
        "id": "A",
        "text": "Decorator Pattern",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "Singleton Pattern",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Observer Pattern",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Factory Pattern",
        "isCorrect": false
      }
    ],
    "explanation": "The Decorator Pattern attaches additional responsibilities to objects without modifying their structure.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "design patterns"
    ]
  },
  {
    "id": "oqc_javascript_17",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · functional programming] Which JavaScript array method is commonly used to transform each element in functional programming?",
    "options": [
      {
        "id": "A",
        "text": "forEach()",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "reduce()",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "map()",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "filter()",
        "isCorrect": false
      }
    ],
    "explanation": "The map() method applies a function to each element and returns a new array.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "functional programming"
    ]
  },
  {
    "id": "oqc_javascript_18",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · functional programming] What does immutability mean in functional programming?",
    "options": [
      {
        "id": "A",
        "text": "Objects cannot be copied",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Functions cannot return values",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Variables can be reassigned freely",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Data structures cannot be modified after creation",
        "isCorrect": true
      }
    ],
    "explanation": "Immutability means once a data structure is created, it cannot be changed directly.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "functional programming"
    ]
  },
  {
    "id": "oqc_javascript_19",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · functional programming] Which higher-order function is best suited for accumulating values into a single result?",
    "options": [
      {
        "id": "A",
        "text": "map()",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "reduce()",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "sort()",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "filter()",
        "isCorrect": false
      }
    ],
    "explanation": "The reduce() function processes each element and accumulates them into a single result.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "functional programming"
    ]
  },
  {
    "id": "oqc_javascript_20",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · functional programming] What is a pure function in JavaScript?",
    "options": [
      {
        "id": "A",
        "text": "A function that modifies global variables",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "A function that uses asynchronous operations",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "A function that always produces the same output for the same input",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "A function that depends on random values",
        "isCorrect": false
      }
    ],
    "explanation": "A pure function always returns the same output for the same input and has no side effects.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "functional programming"
    ]
  },
  {
    "id": "oqc_javascript_21",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · oop] What is the prototype chain in JavaScript used for?",
    "options": [
      {
        "id": "A",
        "text": "To execute asynchronous code",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "To resolve property lookups",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "To manage DOM events",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "To store global variables",
        "isCorrect": false
      }
    ],
    "explanation": "The prototype chain allows property and method lookups to traverse up linked objects.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "oop"
    ]
  },
  {
    "id": "oqc_javascript_22",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · oop] Which keyword is used to define a class in modern JavaScript?",
    "options": [
      {
        "id": "A",
        "text": "function",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "object",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "class",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "constructor",
        "isCorrect": false
      }
    ],
    "explanation": "The class keyword was introduced in ES6 to define classes more cleanly.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "oop"
    ]
  },
  {
    "id": "oqc_javascript_23",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · oop] What does the 'new' keyword do in JavaScript?",
    "options": [
      {
        "id": "A",
        "text": "Creates a new variable",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Calls a function without arguments",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Instantiates an object from a constructor function or class",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Declares a constant",
        "isCorrect": false
      }
    ],
    "explanation": "The new keyword creates an instance of an object using a constructor function or class.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "oop"
    ]
  },
  {
    "id": "oqc_javascript_24",
    "chapterId": "ch_open_javascript",
    "subjectId": "math",
    "type": "single_mcq",
    "prompt": "[JAVASCRIPT · oop] Which method is automatically called when creating a new instance of a class?",
    "options": [
      {
        "id": "A",
        "text": "init()",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "constructor()",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "create()",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "setup()",
        "isCorrect": false
      }
    ],
    "explanation": "The constructor() method is executed when a new instance of a class is created.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (JAVASCRIPT)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "javascript",
      "oop"
    ]
  },
  {
    "id": "oqc_sql_25",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · aggregation grouping] Which SQL clause is used to group rows that have the same values in specified columns into summary rows?",
    "options": [
      {
        "id": "A",
        "text": "ORDER BY",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "WHERE",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "GROUP BY",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "HAVING",
        "isCorrect": false
      }
    ],
    "explanation": "GROUP BY groups rows sharing the same values in the listed columns, allowing aggregate functions to be applied per group.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "aggregation grouping"
    ]
  },
  {
    "id": "oqc_sql_26",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · aggregation grouping] Which aggregate function returns the number of rows in a group, including rows with NULL values?",
    "options": [
      {
        "id": "A",
        "text": "COUNT(column)",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "COUNT(*)",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "SUM(1)",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "COUNT(DISTINCT column)",
        "isCorrect": false
      }
    ],
    "explanation": "COUNT(*) counts all rows in the group, regardless of NULLs. COUNT(column) counts only non-NULL values of that column.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "aggregation grouping"
    ]
  },
  {
    "id": "oqc_sql_27",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · aggregation grouping] What is the primary difference between the WHERE and HAVING clauses?",
    "options": [
      {
        "id": "A",
        "text": "WHERE filters groups, HAVING filters rows",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "WHERE filters rows before grouping, HAVING filters groups after grouping",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "WHERE works with aggregate functions, HAVING does not",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "There is no difference; they are interchangeable",
        "isCorrect": false
      }
    ],
    "explanation": "WHERE filters individual rows before any grouping occurs. HAVING filters groups after GROUP BY has been applied and can use aggregate functions.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "aggregation grouping"
    ]
  },
  {
    "id": "oqc_sql_28",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · aggregation grouping] Which aggregate function calculates the average value of a numeric column?",
    "options": [
      {
        "id": "A",
        "text": "MEAN()",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "AVERAGE()",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "AVG()",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "SUM() / COUNT(*)",
        "isCorrect": false
      }
    ],
    "explanation": "AVG() is the standard SQL aggregate function for computing the arithmetic mean. It ignores NULL values.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "aggregation grouping"
    ]
  },
  {
    "id": "oqc_sql_29",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · joins] What does an INNER JOIN return?",
    "options": [
      {
        "id": "A",
        "text": "All rows from both tables",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Only rows with matching values in both tables",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "All rows from the left table and matched rows from the right",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "All rows from the right table and matched rows from the left",
        "isCorrect": false
      }
    ],
    "explanation": "INNER JOIN returns only the rows where there is a match in both tables based on the join condition.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "joins"
    ]
  },
  {
    "id": "oqc_sql_30",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · joins] Which join returns all rows from the left table and the matched rows from the right table, with NULLs for non-matching right columns?",
    "options": [
      {
        "id": "A",
        "text": "INNER JOIN",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "LEFT JOIN",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "RIGHT JOIN",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "FULL OUTER JOIN",
        "isCorrect": false
      }
    ],
    "explanation": "LEFT JOIN (or LEFT OUTER JOIN) preserves all rows from the left table, filling right table columns with NULL where no match exists.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "joins"
    ]
  },
  {
    "id": "oqc_sql_31",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · joins] What is the result of a CROSS JOIN between table A (5 rows) and table B (3 rows)?",
    "options": [
      {
        "id": "A",
        "text": "5 rows",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "3 rows",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "15 rows",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "8 rows",
        "isCorrect": false
      }
    ],
    "explanation": "CROSS JOIN produces a Cartesian product: every row from table A combined with every row from table B (5 * 3 = 15).",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "joins"
    ]
  },
  {
    "id": "oqc_sql_32",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · joins] In a LEFT JOIN, if there is no match in the right table, what values appear for the right table's columns?",
    "options": [
      {
        "id": "A",
        "text": "Default values defined in the schema",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "NULL",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Empty strings",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "The values from the left table",
        "isCorrect": false
      }
    ],
    "explanation": "When a LEFT JOIN finds no matching row in the right table, the columns from the right table are set to NULL in the result set.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "joins"
    ]
  },
  {
    "id": "oqc_sql_33",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · select filter sort] Which SQL statement is used to retrieve data from a database?",
    "options": [
      {
        "id": "A",
        "text": "GET",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "SELECT",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "RETRIEVE",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "FETCH",
        "isCorrect": false
      }
    ],
    "explanation": "SELECT is the standard SQL command to query data from one or more tables.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "select filter sort"
    ]
  },
  {
    "id": "oqc_sql_34",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · select filter sort] How do you select all columns from a table named 'customers'?",
    "options": [
      {
        "id": "A",
        "text": "SELECT * FROM customers;",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "SELECT ALL FROM customers;",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "SELECT columns FROM customers;",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "SELECT customers.*;",
        "isCorrect": false
      }
    ],
    "explanation": "The asterisk (*) wildcard selects all columns.",
    "difficulty": "Medium",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "select filter sort"
    ]
  },
  {
    "id": "oqc_sql_35",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · select filter sort] Which clause is used to filter records based on a specified condition?",
    "options": [
      {
        "id": "A",
        "text": "ORDER BY",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "GROUP BY",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "WHERE",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "HAVING",
        "isCorrect": false
      }
    ],
    "explanation": "WHERE filters rows before any grouping or sorting.",
    "difficulty": "Easy",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "select filter sort"
    ]
  },
  {
    "id": "oqc_sql_36",
    "chapterId": "ch_open_sql",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "[SQL · select filter sort] What is the correct syntax to select customers from 'USA'?",
    "options": [
      {
        "id": "A",
        "text": "SELECT * FROM customers WHERE country = 'USA';",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "SELECT * FROM customers IF country = 'USA';",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "SELECT * FROM customers FILTER country = 'USA';",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "SELECT * FROM customers HAVING country = 'USA';",
        "isCorrect": false
      }
    ],
    "explanation": "WHERE with equality operator (=) filters rows matching the value.",
    "difficulty": "Hard",
    "examOrigin": "Open Quiz Commons (SQL)",
    "year": 2026,
    "tags": [
      "Open Quiz Commons",
      "CC BY-SA 4.0",
      "sql",
      "select filter sort"
    ]
  },
  {
    "id": "otqa_sci_1",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "Clouds are made up of these.",
    "options": [
      {
        "id": "A",
        "text": "Carbon atoms",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Water droplets and ice crystals",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Oxygen ions",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Dust mites",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Water droplets and ice crystals (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_2",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "This formation is a conical hill or mountain. It is formed by mantle material being pressed through an opening in the Earths crust.",
    "options": [
      {
        "id": "A",
        "text": "A volcano",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "A hill",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "An earthquake",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "A geyser",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: A volcano (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_3",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "Japan suffers from this event very often. It is the sudden, light or violent movement of the earths surface caused by the release of energy in the earths crust.",
    "options": [
      {
        "id": "A",
        "text": "Volcano",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Earthquake",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Tide",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Tsunami",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Earthquake (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_4",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "It is the only continent that does not have land areas below sea level.",
    "options": [
      {
        "id": "A",
        "text": "Australia",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "South America",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Antarctica",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Arctica",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Antarctica (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_5",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "It is the longest river in the world",
    "options": [
      {
        "id": "A",
        "text": "Themes",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "The Amazon",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "The Nile",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Danube",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: The Nile (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_6",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "Why do travelers to La Paz, Bolivia, often become ill as soon as they arrive?",
    "options": [
      {
        "id": "A",
        "text": "Because of the high temperature",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Because of the humidity",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Because of the soil quality",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Because of the altitude",
        "isCorrect": true
      }
    ],
    "explanation": "Correct Answer: Because of the altitude (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_7",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "In the US, why do we change our clocks on the daylight saving time dates in April and October?",
    "options": [
      {
        "id": "A",
        "text": "To conserve energy",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "To increase the hours of the day",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "To extend the working day",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Because the tourist period in most countries starts in May",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: To conserve energy (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_8",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "These are places of arid land with really low rainfall and high tempertures variation. Their vegetation is insignificant and the population of people and animals is very limited.",
    "options": [
      {
        "id": "A",
        "text": "Oceans",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Raiforests",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "The equator",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Deserts",
        "isCorrect": true
      }
    ],
    "explanation": "Correct Answer: Deserts (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_9",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "This is a gemstone made by fossilized tree sap that is at least 30 million years old.",
    "options": [
      {
        "id": "A",
        "text": "Obsidian",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Amber",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Tourmaline",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Malachite",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Amber (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_10",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "This is the largest island on Earth and one third of it is a national park.",
    "options": [
      {
        "id": "A",
        "text": "Greenland",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "Madagaskar",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Australia",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Alaska",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Greenland (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_11",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "Which of these organs has no known function in the human body?",
    "options": [
      {
        "id": "A",
        "text": "tonsils",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "appendix",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "uvula",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "pineal gland",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: appendix (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_12",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "The main function of this organ of respiration is to transport oxygen from the atmosphere into the bloodstream.",
    "options": [
      {
        "id": "A",
        "text": "stomach",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "diaphragm",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "trachea",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "lung",
        "isCorrect": true
      }
    ],
    "explanation": "Correct Answer: lung (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_13",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "This gland is shaped like a butterfly and helps regulate energy in the body.",
    "options": [
      {
        "id": "A",
        "text": "parathyroid",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "thyroid",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "adrenal",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "thymus",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: thyroid (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_14",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "These organs are very sensitive and often fail in people with very high blood pressure or diabetes.",
    "options": [
      {
        "id": "A",
        "text": "pancreas",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "kidneys",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "ovaries",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "lungs",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: kidneys (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_15",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "This is one of the first signs of pregnancy.",
    "options": [
      {
        "id": "A",
        "text": "Swollen Feet",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Missed period",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Hair loss",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Waddling",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Missed period (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_16",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "This doctor takes care of you and your baby during pregnancy.",
    "options": [
      {
        "id": "A",
        "text": "Psychologist",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Periodontist",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Obstetrician",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Pediatrician",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Obstetrician (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_17",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "What is the most common method of child birth?",
    "options": [
      {
        "id": "A",
        "text": "Cesarean",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Vaginal",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "Water birth",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "In Vitro Fertilization",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Vaginal (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_18",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "What are common side effects of pregnancy?",
    "options": [
      {
        "id": "A",
        "text": "Stretch marks",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Morning Sickness",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "All of the these",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Weight gain",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: All of the these (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_19",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "How far along are you approximately, when you feel the baby move for the first time?",
    "options": [
      {
        "id": "A",
        "text": "10 weeks",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "35 weeks",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "2 weeks",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "20 weeks",
        "isCorrect": true
      }
    ],
    "explanation": "Correct Answer: 20 weeks (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_20",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "What is suggested that you not do several hours before you go into labor?  It could get you embarrassed.",
    "options": [
      {
        "id": "A",
        "text": "Eat fish",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Have sex",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Talk on the phone",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Eat food",
        "isCorrect": true
      }
    ],
    "explanation": "Correct Answer: Eat food (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_21",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "What is also delivered along with the baby or immediately after its birth?",
    "options": [
      {
        "id": "A",
        "text": "Feet",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Shoulders",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Placenta",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "Handbook",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Placenta (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_22",
    "chapterId": "ch_open_science",
    "subjectId": "chemistry",
    "type": "single_mcq",
    "prompt": "These small bodies are considered left overs from the formation of the Solar system some 4.6 billion years ago.",
    "options": [
      {
        "id": "A",
        "text": "Comets",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Stars",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Planets",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Asteroids",
        "isCorrect": true
      }
    ],
    "explanation": "Correct Answer: Asteroids (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_23",
    "chapterId": "ch_open_science",
    "subjectId": "physics",
    "type": "single_mcq",
    "prompt": "These are lumps of ice and dust.  When they get close enough to the Sun they gradually evaporate.  Jets of gas and dust create long tails that people can see from Earth.",
    "options": [
      {
        "id": "A",
        "text": "Asteroids",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "Comets",
        "isCorrect": true
      },
      {
        "id": "C",
        "text": "UFOs",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Stars",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Comets (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Easy",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  },
  {
    "id": "otqa_sci_24",
    "chapterId": "ch_open_science",
    "subjectId": "biology",
    "type": "single_mcq",
    "prompt": "This planet is slightly smaller than Earth and its closest neighbor (excluding the Moon).",
    "options": [
      {
        "id": "A",
        "text": "Venus",
        "isCorrect": true
      },
      {
        "id": "B",
        "text": "Uranus",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "Mars",
        "isCorrect": false
      },
      {
        "id": "D",
        "text": "Saturn",
        "isCorrect": false
      }
    ],
    "explanation": "Correct Answer: Venus (Source: OpenTriviaQA Science & Technology · CC BY-SA 4.0).",
    "difficulty": "Medium",
    "examOrigin": "OpenTriviaQA Science",
    "year": 2026,
    "tags": [
      "OpenTriviaQA",
      "Science & Tech",
      "CC BY-SA 4.0"
    ]
  }
];
