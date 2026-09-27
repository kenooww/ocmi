import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Anchor, ArrowLeft, CheckCircle2, Send } from 'lucide-react';

const fields = [
    { name: 'first_name', label: 'First name', autoComplete: 'given-name' },
    { name: 'middle_name', label: 'Middle name', autoComplete: 'additional-name', optional: true },
    { name: 'last_name', label: 'Last name', autoComplete: 'family-name' },
    { name: 'birthday', label: 'Birthday', type: 'date', autoComplete: 'bday' },
    { name: 'contact_number', label: 'Contact number', type: 'tel', autoComplete: 'tel', placeholder: 'e.g. +63 917 123 4567', maxLength: 50 },
    { name: 'vessel', label: 'Vessel', placeholder: 'Vessel name or type' },
    { name: 'current_location', label: 'Current location', placeholder: 'City and country' },
    { name: 'present_salary', label: 'Present salary', placeholder: 'e.g. USD 2,000/month or Not applicable', maxLength: 100 },
    { name: 'document_status', label: 'Document status', textarea: true, placeholder: 'Describe the availability or renewal status of your maritime documents.', maxLength: 2000 },
];

export default function Inquiry({ submitted = false }) {
    const { companySettings: company = {} } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm(Object.fromEntries(fields.map(({ name }) => [name, ''])));
    const today = new Date();
    const maximumBirthday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const submit = (event) => {
        event.preventDefault();
        post(route('inquiry.store'), {
            onSuccess: () => reset(),
            onError: (validationErrors) => document.getElementById(`inquiry-${Object.keys(validationErrors)[0]}`)?.focus(),
        });
    };

    const sections = [
        { title: 'Personal Information', description: 'Your name, birthday, and contact details.', names: ['first_name', 'middle_name', 'last_name', 'birthday', 'contact_number', 'current_location'] },
        { title: 'Vessel & Documents', description: 'Your vessel, current salary, and document status.', names: ['vessel', 'present_salary', 'document_status'] },
    ];
    const primaryButton = 'inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12364F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3049] disabled:cursor-wait disabled:opacity-60';

    return (
        <div className="min-h-screen w-full bg-[#EEF2F0] px-4 py-8 text-[#16222B]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Head title="Submit an inquiry"><meta name="description" content="Send your maritime inquiry and share your experience and document status with our crewing team." /></Head>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');`}</style>
            <header className="mx-auto mb-6 flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={route('homepage')} className="flex min-w-0 items-center gap-2">
                    {company.logo_url ? <img src={company.logo_url} alt={`${company.company_name || 'Company'} logo`} className="h-12 w-12 shrink-0 rounded bg-white object-contain p-1" /> : <Anchor size={22} strokeWidth={1.6} className="shrink-0 text-[#0F3049]" />}
                    <span className="break-words text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>{company.company_name || 'Company'}</span>
                </Link>
                <Link href={route('homepage')} className="inline-flex shrink-0 items-center gap-2 text-xs text-[#5B6B70] hover:text-[#0F3049]"><ArrowLeft size={14} /> Back to homepage</Link>
            </header>
            <main className="mx-auto max-w-6xl">
                <div className="rounded border border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>{submitted ? 'Inquiry submitted' : 'Submit your inquiry'}</h1>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5B6B70]">{submitted ? 'Thank you for sharing your details with our crewing team.' : 'Fill in your personal information, vessel details, and document status to send an inquiry to our crewing team.'}</p>
                </div>
                {submitted ? (
                    <section className="mt-6 rounded border border-slate-200 bg-white p-6 shadow-sm sm:p-8" role="status">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E1EBE6] text-[#1F6F5C]"><CheckCircle2 size={23} /></span>
                            <div><h2 className="text-base font-semibold">Your inquiry has been received</h2><p className="mt-2 text-sm leading-6 text-[#5B6B70]">Your details are now with our team.</p></div>
                        </div>
                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <Link href={route('inquiry.create')} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Submit another inquiry</Link>
                            <Link href={route('homepage')} className={primaryButton}>Return to homepage</Link>
                        </div>
                    </section>
                ) : (
                    <form onSubmit={submit} className="mt-6">
                        <p className="text-xs leading-6 text-[#5B6B70]">Fields marked <span className="text-red-500">*</span> are required. Middle name is optional. Enter “Not applicable” for vessel, salary, or document details that do not apply.</p>
                        {sections.map((section, index) => (
                            <section key={section.title} aria-labelledby={`inquiry-section-${index}`}>
                                <div className="mb-3 mt-6 flex items-center gap-3">
                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1EBE6] text-sm font-semibold text-[#1F6F5C]">{index + 1}</span>
                                    <h2 id={`inquiry-section-${index}`} className="text-base font-semibold text-slate-900">{section.title}</h2>
                                </div>
                                <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
                                    <p className="mb-3 text-sm text-[#5B6B70]">{section.description}</p>
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                                        {section.names.map((name) => {
                                            const field = fields.find((item) => item.name === name);
                                            const Input = field.textarea ? 'textarea' : 'input';
                                            return (
                                                <div key={name} className={field.textarea ? 'sm:col-span-2' : ''}>
                                                    <label htmlFor={`inquiry-${name}`} className="block text-xs font-medium text-slate-500">{field.label}{field.optional ? <span className="ml-1 font-normal">(optional)</span> : <span className="ml-1 text-red-500">*</span>}</label>
                                                    <Input id={`inquiry-${name}`} name={name} type={field.textarea ? undefined : field.type || 'text'} rows={field.textarea ? 4 : undefined}
                                                        value={data[name]} onChange={(event) => setData(name, event.target.value)} required={!field.optional}
                                                        maxLength={field.maxLength || 255} max={name === 'birthday' ? maximumBirthday : undefined}
                                                        autoComplete={field.autoComplete} placeholder={field.placeholder} aria-invalid={!!errors[name]}
                                                        aria-describedby={errors[name] ? `inquiry-${name}-error` : undefined}
                                                        className={`mt-1 w-full rounded border bg-white p-2.5 text-sm text-slate-900 shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B] ${errors[name] ? 'border-red-300' : 'border-slate-300'}`} />
                                                    {errors[name] && <p id={`inquiry-${name}-error`} className="mt-1 text-xs text-red-600" role="alert">{errors[name]}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        ))}
                        <p className="mt-5 text-xs leading-6 text-[#5B6B70]">The details you provide will be used to review and respond to your inquiry.</p>
                        <div className="sticky bottom-0 z-20 mt-5 flex justify-end border-t border-slate-200 bg-[#EEF2F0]/95 py-4 backdrop-blur">
                            <button type="submit" disabled={processing} className={`${primaryButton} w-full sm:w-auto`}><Send size={16} />{processing ? 'Submitting…' : 'Submit inquiry'}</button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
