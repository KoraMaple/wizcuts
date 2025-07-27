'use client';

import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { OAuthStrategy } from '@clerk/types';
import { useSignIn } from '@clerk/nextjs';

export default function SignInPage() {
  const { signIn } = useSignIn();

  if (!signIn) return null;

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/',
      })
      .then(res => {
        console.log(res);
      })
      .catch((err: any) => {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.log(err.errors);
        console.error(err, null, 2);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-cream mb-2">WizCuts</h1>
          <p className="text-slate-300 text-lg">
            Continue to book your appointment
          </p>
        </div>

        {/* Custom Sign In Card */}
        <div className="bg-charcoal/50 backdrop-blur-sm border border-slate-600/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-cream mb-2">Sign In</h2>
            <p className="text-slate-400">
              Choose your preferred method to continue
            </p>
          </div>

          {/* Social Sign In Buttons */}
          <div className="space-y-4">
            {/* Google Button */}
            <button
              onClick={() => signInWith('oauth_google')}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              <FaGoogle className="text-xl" />
              Continue with Google
            </button>

            {/* Facebook Button */}
            <button
              onClick={() => signInWith('oauth_facebook')}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              <FaFacebook className="text-xl" />
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-gold hover:text-gold/90 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="text-gold hover:text-gold/90 underline"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
