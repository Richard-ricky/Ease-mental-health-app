import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { Heart, Mail, Lock, User } from "lucide-react";
import { supabase, projectId, publicAnonKey } from "../../utils/supabase/client.ts";

export function AuthForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: ""
  });

  const handleSignUp = async () => {
    if (!signUpForm.name || !signUpForm.email || !signUpForm.password) {
      console.log('Please fill in all fields');
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      console.log('Passwords do not match');
      return;
    }

    if (signUpForm.password.length < 6) {
      console.log('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Create user via our backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bba6a6a2/signup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: signUpForm.email,
            password: signUpForm.password,
            name: signUpForm.name
          })
        }
      );

      if (response.ok) {
        // Now sign in the user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: signUpForm.email,
          password: signUpForm.password
        });

        if (error) {
          console.error('Sign in after sign up error:', error);
          console.log('Account created! Please try signing in.');
        } else {
          console.log('User signed up and signed in:', data);
          console.log('Welcome to Ease! Account created successfully.');
          onAuthSuccess();
        }
      } else {
        const error = await response.json();
        console.error('Sign up error:', error);
        console.error(error.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Sign up exception:', error);
      console.error('An error occurred during sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!signInForm.email || !signInForm.password) {
      console.log('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: signInForm.password
      });

      if (error) {
        console.error('Sign in error:', error);
        console.error('Invalid email or password. Please try again.');
      } else {
        console.log('User signed in:', data);
        console.log('Welcome back!');
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      console.error('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4 space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Ease
            </h1>
          </div>
          <CardTitle>Join Our Mental Health Community</CardTitle>
          <p className="text-sm text-gray-600">
            A safe space to express yourself and connect with others
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <div className="relative">
                  <User className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your name"
                    className="pl-10"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Choose a strong password"
                    className="pl-10"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && handleSignUp()}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-sm text-center text-gray-500">
            <p>
              By joining Ease, you agree to our commitment to providing a safe, 
              supportive environment for mental health discussions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}