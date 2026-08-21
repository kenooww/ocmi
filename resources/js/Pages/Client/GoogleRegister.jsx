import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Fonts: this design assumes "Space Grotesk" (headline) and "Inter" (body).
 * Add to your root layout <head> if not already present:
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
 */

export default function GoogleRegister({ notice, error }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F6F7FB] px-4 py-10">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.15)] overflow-hidden">

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6">
                        <h1 className="text-[1.6rem] leading-tight font-semibold tracking-tight text-[#16213E]"
                            style={{ fontFamily: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif' }}>
                            Create your account
                        </h1>
                        <p className="mt-2 text-[0.925rem] leading-relaxed text-slate-500">
                            Continue with Google, then confirm your email to finish setting up.
                        </p>
                    </div>

                    {/* Alerts */}
                    {(notice || error) && (
                        <div className="px-8">
                            {notice && (
                                <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3.5 py-3 text-sm text-emerald-800">
                                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{notice}</span>
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-3 text-sm text-red-700">
                                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Google CTA */}
                    

                    {/* Steps — reflects the real two-step flow described above */}
                    
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/seafarers/login" className="font-medium text-[#4F46E5] hover:text-[#4338CA]">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
