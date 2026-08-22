import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText } from 'lucide-react';

export default function ResumeViewer({ title, fileName, fileType, canPreview, fileUrl, downloadUrl, backUrl }) {
    const isImage = ['jpg', 'jpeg', 'png'].includes((fileType || '').toLowerCase());

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-4">
                <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <Link
                            href={backUrl || '#'}
                            className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#E1EBE6] text-[#1F6F5C]">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-semibold text-slate-900">{title || 'Resume Attachment'}</h1>
                                <p className="truncate text-sm text-slate-500">{fileName || 'resume'}</p>
                            </div>
                        </div>
                    </div>

                    <a
                        href={downloadUrl}
                        className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F]"
                    >
                        <Download size={16} />
                        Download
                    </a>
                </div>

                <div className="min-h-[70vh] overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                    {canPreview ? (
                        isImage ? (
                            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-4">
                                <img src={fileUrl} alt={fileName || 'Resume attachment'} className="max-h-[78vh] max-w-full object-contain" />
                            </div>
                        ) : (
                            <iframe
                                src={fileUrl}
                                title={fileName || 'Resume attachment'}
                                className="h-[78vh] w-full bg-white"
                            />
                        )
                    ) : (
                        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
                            <FileText size={42} className="text-slate-300" />
                            <h2 className="mt-4 text-base font-semibold text-slate-900">Preview is not available for this file type.</h2>
                            <p className="mt-2 max-w-md text-sm text-slate-500">
                                Word documents cannot be previewed directly in this viewer. Use the Download button to open the resume on your device.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
