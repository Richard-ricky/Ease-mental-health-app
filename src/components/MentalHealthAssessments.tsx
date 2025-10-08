import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ClipboardList, TrendingUp, AlertTriangle, CheckCircle, Brain } from "lucide-react";

interface Assessment {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  interpretation: (score: number) => AssessmentResult;
}

interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

interface AssessmentResult {
  score: number;
  level: 'minimal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  recommendations: string[];
  color: string;
}

export function MentalHealthAssessments() {
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [completedAssessments, setCompletedAssessments] = useState<AssessmentResult[]>([]);

  const phq9: Assessment = {
    id: 'phq9',
    name: 'PHQ-9 Depression Screening',
    description: 'A 9-question tool to screen for depression severity',
    questions: [
      {
        id: 'q1',
        text: 'Little interest or pleasure in doing things',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q2',
        text: 'Feeling down, depressed, or hopeless',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q3',
        text: 'Trouble falling or staying asleep, or sleeping too much',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q4',
        text: 'Feeling tired or having little energy',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q5',
        text: 'Poor appetite or overeating',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q6',
        text: 'Feeling bad about yourself or that you are a failure',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q7',
        text: 'Trouble concentrating on things, such as reading or watching TV',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q8',
        text: 'Moving or speaking slowly, or being fidgety or restless',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q9',
        text: 'Thoughts that you would be better off dead or hurting yourself',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      }
    ],
    interpretation: (score: number): AssessmentResult => {
      if (score <= 4) {
        return {
          score,
          level: 'minimal',
          interpretation: 'Minimal depression symptoms',
          recommendations: [
            'Continue with regular self-care practices',
            'Maintain healthy lifestyle habits',
            'Consider preventive mental health strategies'
          ],
          color: 'text-green-600'
        };
      } else if (score <= 9) {
        return {
          score,
          level: 'mild',
          interpretation: 'Mild depression symptoms',
          recommendations: [
            'Monitor symptoms closely',
            'Consider counseling or therapy',
            'Increase physical activity and social connection',
            'Practice stress management techniques'
          ],
          color: 'text-yellow-600'
        };
      } else if (score <= 14) {
        return {
          score,
          level: 'moderate',
          interpretation: 'Moderate depression symptoms',
          recommendations: [
            'Strongly consider professional help',
            'Contact a mental health provider',
            'Consider medication evaluation',
            'Implement structured daily routines'
          ],
          color: 'text-orange-600'
        };
      } else {
        return {
          score,
          level: 'severe',
          interpretation: 'Severe depression symptoms',
          recommendations: [
            'Seek immediate professional help',
            'Contact your healthcare provider today',
            'Consider crisis support if having thoughts of self-harm',
            'Reach out to trusted friends or family for support'
          ],
          color: 'text-red-600'
        };
      }
    }
  };

  const gad7: Assessment = {
    id: 'gad7',
    name: 'GAD-7 Anxiety Screening',
    description: 'A 7-question tool to screen for generalized anxiety disorder',
    questions: [
      {
        id: 'q1',
        text: 'Feeling nervous, anxious, or on edge',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q2',
        text: 'Not being able to stop or control worrying',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q3',
        text: 'Worrying too much about different things',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q4',
        text: 'Trouble relaxing',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q5',
        text: 'Being so restless that it is hard to sit still',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q6',
        text: 'Becoming easily annoyed or irritable',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'q7',
        text: 'Feeling afraid, as if something awful might happen',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      }
    ],
    interpretation: (score: number): AssessmentResult => {
      if (score <= 4) {
        return {
          score,
          level: 'minimal',
          interpretation: 'Minimal anxiety symptoms',
          recommendations: [
            'Continue with stress management practices',
            'Maintain regular exercise and sleep',
            'Practice mindfulness techniques'
          ],
          color: 'text-green-600'
        };
      } else if (score <= 9) {
        return {
          score,
          level: 'mild',
          interpretation: 'Mild anxiety symptoms',
          recommendations: [
            'Learn relaxation techniques',
            'Consider counseling for coping strategies',
            'Monitor stress levels and triggers',
            'Practice deep breathing exercises'
          ],
          color: 'text-yellow-600'
        };
      } else if (score <= 14) {
        return {
          score,
          level: 'moderate',
          interpretation: 'Moderate anxiety symptoms',
          recommendations: [
            'Consider professional therapy',
            'Contact a mental health provider',
            'Learn cognitive behavioral techniques',
            'Consider medication evaluation'
          ],
          color: 'text-orange-600'
        };
      } else {
        return {
          score,
          level: 'severe',
          interpretation: 'Severe anxiety symptoms',
          recommendations: [
            'Seek professional help immediately',
            'Contact your healthcare provider',
            'Consider intensive therapy options',
            'Practice grounding techniques for immediate relief'
          ],
          color: 'text-red-600'
        };
      }
    }
  };

  const assessments = [phq9, gad7];

  const startAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (activeAssessment && currentQuestion < activeAssessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    if (!activeAssessment) return;

    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const result = activeAssessment.interpretation(totalScore);
    setResults(result);
    setCompletedAssessments(prev => [...prev, result]);
  };

  const resetAssessment = () => {
    setActiveAssessment(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  };

  if (results) {
    return (
      <div className="space-y-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              <span>{activeAssessment?.name} Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${results.color}`}>
                {results.score}
              </div>
              <p className="text-xl font-semibold">{results.interpretation}</p>
              <Badge className={`mt-2 ${results.color.replace('text-', 'bg-').replace('-600', '-100')} text-gray-800`}>
                {results.level.charAt(0).toUpperCase() + results.level.slice(1)} Level
              </Badge>
            </div>

            <Alert className={results.level === 'severe' ? 'border-red-200 bg-red-50' : ''}>
              {results.level === 'severe' && <AlertTriangle className="w-4 h-4 text-red-600" />}
              <AlertDescription>
                <div className="space-y-3">
                  <h4 className="font-semibold">Recommendations:</h4>
                  <ul className="space-y-1">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {results.level === 'severe' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription>
                  <strong>Important:</strong> If you're having thoughts of self-harm, please reach out for immediate help:
                  <br />• Crisis Text Line: Text HOME to 741741
                  <br />• National Suicide Prevention Lifeline: 988
                  <br />• Emergency Services: 911
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4">
              <Button onClick={resetAssessment} className="flex-1">
                Take Another Assessment
              </Button>
              <Button variant="outline" onClick={() => window.open('/support', '_blank')} className="flex-1">
                Find Support Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeAssessment) {
    const progress = ((currentQuestion + 1) / activeAssessment.questions.length) * 100;
    const currentQ = activeAssessment.questions[currentQuestion];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{activeAssessment.name}</span>
              <Badge variant="secondary">
                {currentQuestion + 1} of {activeAssessment.questions.length}
              </Badge>
            </CardTitle>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Over the last 2 weeks, how often have you been bothered by:
              </h3>
              <p className="mb-6 text-xl">{currentQ.text}?</p>
            </div>

            <RadioGroup
              value={answers[currentQ.id]?.toString() || ''}
              onValueChange={(value:string) => handleAnswer(currentQ.id, parseInt(value))}
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={answers[currentQ.id] === undefined}
              >
                {currentQuestion === activeAssessment.questions.length - 1 ? 'Get Results' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6 space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Mental Health Assessments</h2>
          <p className="text-gray-600">Clinically validated screening tools to understand your mental health</p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          These assessments are screening tools and not diagnostic instruments. 
          Results should be discussed with a healthcare professional for proper evaluation and treatment planning.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <span>{assessment.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{assessment.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{assessment.questions.length} questions</span>
                <span>~3-5 minutes</span>
              </div>
              <Button onClick={() => startAssessment(assessment)} className="w-full">
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {completedAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Assessment History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedAssessments.slice(-3).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium">{result.interpretation}</p>
                    <p className="text-sm text-gray-600">Score: {result.score}</p>
                  </div>
                  <Badge className={result.level === 'minimal' ? 'bg-green-100 text-green-800' : 
                                   result.level === 'mild' ? 'bg-yellow-100 text-yellow-800' :
                                   result.level === 'moderate' ? 'bg-orange-100 text-orange-800' :
                                   'bg-red-100 text-red-800'}>
                    {result.level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}