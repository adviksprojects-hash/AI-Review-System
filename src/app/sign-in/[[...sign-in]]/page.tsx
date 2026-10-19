import { SignIn } from '@clerk/nextjs';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Admin Portal Authentication</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span>AI Review &amp; Menu Hub</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Sign in to manage Google Place AI reviews, digital menus, and smart NFC/QR standees.
        </p>
      </div>

      <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-700/50 bg-white">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm normal-case shadow-sm',
              card: 'shadow-none border-none p-6 sm:p-8',
              headerTitle: 'text-xl font-bold text-slate-800',
              headerSubtitle: 'text-xs text-slate-500',
              socialButtonsBlockButton:
                'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs',
              footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
            },
          }}
        />
      </div>
    </div>
  );
}
