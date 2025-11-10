import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Mail, LogIn, UserCheck } from "lucide-react";

const InvitationHelp = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Team Invitation Help</h1>
          <p className="text-muted-foreground">
            Having trouble accepting a team invitation? Here's how to fix common issues.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              How to Accept an Invitation
            </CardTitle>
            <CardDescription>Follow these steps to successfully join a team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    Look for an invitation email with the subject "You've been invited to join [Team Name]"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Click "Accept Invitation"</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the button in the email to start the acceptance process
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sign in or create an account</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Important:</strong> Use the same email address that received the invitation
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Join the team</h3>
                  <p className="text-sm text-muted-foreground">
                    Once signed in, you'll automatically be added to the team
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Common Issues & Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-destructive">✗</span>
                "Email Mismatch" Error
              </h3>
              <Alert>
                <AlertTitle>Why this happens</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    The invitation was sent to one email address (e.g., john@gmail.com), but you signed in with a different one (e.g., john@work.com).
                  </p>
                  <div className="mt-3">
                    <strong>Solution:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Click "Sign in with Different Email"</li>
                      <li>Sign out of your current account</li>
                      <li>Sign in or sign up using the email that received the invitation</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-destructive">✗</span>
                Google Sign-in Issues
              </h3>
              <Alert>
                <AlertTitle>Why this happens</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    When using "Continue with Google", you may have selected a different Google account than the one that received the invitation.
                  </p>
                  <div className="mt-3">
                    <strong>Solution:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Make sure you select the correct Google account (the one that received the invitation)</li>
                      <li>If the wrong account signs in automatically, sign out first</li>
                      <li>Try using email/password sign-up instead if you keep having issues</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-destructive">✗</span>
                "Invalid Invitation Link"
              </h3>
              <Alert>
                <AlertTitle>Why this happens</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    The invitation link may be expired, already used, or incorrectly copied.
                  </p>
                  <div className="mt-3">
                    <strong>Solution:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Ask the team admin to resend the invitation</li>
                      <li>Make sure you're copying the complete URL from the email</li>
                      <li>Check that the invitation hasn't expired (usually valid for 7 days)</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Always use the same email address that received the invitation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Accept invitations within 7 days before they expire
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  If using Google Sign-in, verify you're selecting the correct Google account
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Check your spam folder if you don't see the invitation email
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate("/auth")} variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Go to Sign In
          </Button>
          <Button onClick={() => navigate("/teams")}>
            <UserCheck className="mr-2 h-4 w-4" />
            View My Teams
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvitationHelp;
