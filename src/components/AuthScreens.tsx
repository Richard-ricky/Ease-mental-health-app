import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Alert, AlertDescription } from "./ui/alert.tsx";
import { Separator } from "./ui/separator.tsx";
import { Heart, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Shield, Sparkles, Zap, Chrome, Bug } from "lucide-react";
import { supabase, apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";
import { ApiDebugger } from "./ApiDebugger.tsx";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications?: boolean;
    privacy?: {
      anonymousMode: boolean;
      dataSharing: boolean;
    };
  };
}

interface AuthScreensProps {
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

export function AuthScreens({ onAuthSuccess, onBack }: AuthScreensProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        console.log('Starting signup process...');
        
        // Sign up with Supabase
        const response = await apiCall('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name
          })
        });

        console.log('Signup response:', response);

        if (!response.success) {
          throw new Error(response.error || 'Failed to create account');
        }

        toast.success("Account created successfully! Please sign in.");
        setIsSignUp(false);
        setFormData({ ...formData, password: "", confirmPassword: "" });
      } else {
        // Sign in with Supabase
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (session?.user) {
          // Fetch user profile from our backend
          const userData = await apiCall('/user/profile');
          
          const profileData = userData.success ? userData.user : null;
          
          const user: User = {
            id: session.user.id,
            name: profileData?.name || session.user.user_metadata?.name || formData.name || session.user.email?.split('@')[0] || '',
            email: session.user.email!,
            avatar: session.user.user_metadata?.avatar_url,
            preferences: profileData?.preferences || {
              theme: 'light',
              notifications: true,
              privacy: {
                anonymousMode: false,
                dataSharing: false
              }
            }
          };

          onAuthSuccess(user);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = '';
      if (error.message && error.message.includes('API call failed: 404')) {
        errorMessage = `Server endpoint not found. Please check the backend configuration.`;
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = `Cannot connect to server. Please check your network connection.`;
      } else {
        errorMessage = error.message || (isSignUp ? "Failed to create account" : "Failed to sign in");
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}?section=home`
        }
      });

      if (error) throw error;

      toast.success(`Signing in with ${provider}...`);
    } catch (error: any) {
      console.error('Social auth error:', error);
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bg-purple-300 rounded-full -top-40 -right-40 w-80 h-80 mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-600 dark:opacity-30"></div>
        <div className="absolute bg-yellow-300 rounded-full -bottom-40 -left-40 w-80 h-80 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-yellow-600 dark:opacity-30"></div>
        <div className="absolute bg-pink-300 rounded-full top-40 left-40 w-80 h-80 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600 dark:opacity-30"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/20">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center"
            >
              <div className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <div>
              <CardTitle className="text-2xl text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                {isSignUp ? "Join Ease" : "Welcome Back"}
              </CardTitle>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {isSignUp 
                  ? "Start your mental wellness journey with AI-powered support" 
                  : "Continue your wellness journey with cloud sync and AI insights"
                }
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute left-4 top-4 hover:bg-white/50 dark:hover:bg-gray-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertDescription className="text-red-700 dark:text-red-400">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Social Login Options */}
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialAuth('google')}
                disabled={isLoading}
                variant="outline"
                className="w-full border-gray-200 bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
              
              <div className="relative">
                <Separator />
                <span className="absolute px-2 text-xs text-gray-500 -translate-x-1/2 -translate-y-1/2 bg-white left-1/2 top-1/2 dark:bg-gray-800">
                  or
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`bg-white/50 dark:bg-gray-700/50 ${errors.name ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`bg-white/50 dark:bg-gray-700/50 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`bg-white/50 dark:bg-gray-700/50 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute w-6 h-6 p-0 -translate-y-1/2 right-2 top-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Confirm Password</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`bg-white/50 dark:bg-gray-700/50 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                  />
                ) : (
                  <>
                    {isSignUp ? (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-4 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                disabled={isLoading}
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>

              {/* Features Preview */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">AI Companion</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Secure & Private</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cloud Sync</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Debugger */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugger(!showDebugger)}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            <Bug className="w-3 h-3 mr-1" />
            {showDebugger ? 'Hide' : 'Show'} API Debug Tools
          </Button>
          
          {showDebugger && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <ApiDebugger />
            </motion.div>
          )}
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400"
        >
          <p>
            By continuing, you agree to our terms and privacy policy. 
            Your mental health data is encrypted and secure.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}