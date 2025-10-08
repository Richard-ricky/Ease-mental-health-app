import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Alert, AlertDescription } from "./ui/alert.tsx";
import { Phone, MessageCircle, Globe, AlertTriangle, Heart } from "lucide-react";

export function EmergencySupport() {
  const crisisResources = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 free and confidential support",
      type: "call"
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "24/7 crisis support via text",
      type: "text"
    },
    {
      name: "NAMI Helpline",
      number: "1-800-950-6264",
      description: "Information and referral services",
      type: "call"
    }
  ];

  const quickActions = [
    {
      title: "Call 911",
      description: "If you're in immediate danger",
      icon: Phone,
      action: () => window.open("tel:911"),
      urgent: true
    },
    {
      title: "Crisis Chat",
      description: "Chat with a crisis counselor now",
      icon: MessageCircle,
      action: () => window.open("https://suicidepreventionlifeline.org/chat/"),
      urgent: false
    },
    {
      title: "Find Local Help",
      description: "Locate nearby mental health services",
      icon: Globe,
      action: () => console.log("Opening local resources"),
      urgent: false
    }
  ];

  const breathingExercise = {
    steps: [
      "Find a comfortable position",
      "Close your eyes or focus on a fixed point",
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat this cycle 5-10 times"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>In Crisis?</strong> If you're having thoughts of hurting yourself or others, please reach out for help immediately. You're not alone.
        </AlertDescription>
      </Alert>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Immediate Help</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                variant={action.urgent ? "destructive" : "outline"}
                className="justify-start h-auto p-4"
              >
                <div className="flex items-center space-x-3">
                  <action.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm opacity-80">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crisis Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Crisis Support Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crisisResources.map((resource, index) => (
              <div key={index} className="flex items-start p-3 space-x-3 rounded-lg bg-gray-50">
                {resource.type === "call" ? (
                  <Phone className="w-5 h-5 mt-1 text-blue-600" />
                ) : (
                  <MessageCircle className="w-5 h-5 mt-1 text-green-600" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{resource.name}</h4>
                  <p className="font-mono text-lg text-blue-600">{resource.number}</p>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => window.open(resource.type === "call" ? `tel:${resource.number}` : `sms:741741`)}
                >
                  {resource.type === "call" ? "Call" : "Text"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breathing Exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <span>Quick Breathing Exercise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Try this breathing exercise to help calm your mind and body:
          </p>
          <ol className="space-y-2">
            {breathingExercise.steps.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
          <Button className="w-full mt-4" variant="outline">
            Start Guided Breathing
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 text-sm text-center text-gray-500 rounded-lg bg-gray-50">
        <p>
          <strong>Disclaimer:</strong> This app is not a substitute for professional medical advice, diagnosis, or treatment. 
          Always seek the advice of qualified health providers with any questions you may have regarding a mental health condition.
        </p>
      </div>
    </div>
  );
}