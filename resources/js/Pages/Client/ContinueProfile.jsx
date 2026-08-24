import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';

const PALETTE = {
    navy: '#0F3049',
    paper: '#EEF2F0',
    card: '#FFFFFF',
    line: '#DCE3DF',
    teal: '#1F6F5C',
    tealBg: '#E1EBE6',
    rust: '#A23E34',
    ink: '#16222B',
    sub: '#5B6B70',
};

const TYPE_OF_JOB_OPTIONS = [
    'Landbased/Skilled/Office Job',
    'Seabased/Seaman',
];

const STATUS_OPTIONS = [
    'single',
    'married',
    'widowed',
    'divorced',
    'separated',
];

const GENDER_OPTIONS = [
    'Male',
    'Female',
];

function AnchorIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" stroke={PALETTE.navy} strokeWidth="1.6" />
            <path d="M12 7v14M7 13a5 5 0 0010 0M4 13H7M17 13h3M12 21c-3 0-5-1.5-5-1.5"
                stroke={PALETTE.navy} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function fieldStyle(err) {
    return {
        backgroundColor: '#fff',
        border: `1px solid ${err ? PALETTE.rust : PALETTE.line}`,
        color: PALETTE.ink,
    };
}

function Field({ data, errors, setData, label, name, type = 'text', placeholder, required = false, options = [] }) {
    return (
        <div>
            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                {label}
            </label>
            {type === 'select' ? (
                <select
                    id={`field-${name}`}
                    name={name}
                    value={data[name] ?? ''}
                    onChange={(e) => setData(name, e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm outline-none"
                    style={fieldStyle(errors[name])}
                    required={required}
                >
                    <option value="">Select {label.toLowerCase()}</option>
                    {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            ) : (
                <input
                    id={`field-${name}`}
                    name={name}
                    type={type}
                    value={data[name] ?? ''}
                    onChange={(e) => setData(name, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded text-sm outline-none"
                    style={fieldStyle(errors[name])}
                    required={required}
                />
            )}
            {errors[name] && (
                <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors[name]}</p>
            )}
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2
            className="text-xs uppercase tracking-wide mt-6 mb-3 pb-1"
            style={{ color: PALETTE.teal, borderBottom: `1px solid ${PALETTE.line}`, fontWeight: 600 }}
        >
            {children}
        </h2>
    );
}

export default function ContinueProfile({ client }) {
    const { props } = usePage();
    const company = props?.companySettings || {};
    const logoUrl = company.logo ? `/storage/${company.logo}` : null;
    const notice = props?.flash?.notice ?? null;
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'success' | 'error'
    const [modalMessage, setModalMessage] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    const { data, setData, post, processing, errors, transform } = useForm({
        // Identity
        first_name: client?.first_name || '',
        middle_name: client?.middle_name || '',
        last_name: client?.last_name || '',
        gender: client?.gender || '',
        status: client?.status || '',
        type_of_job: client?.type_of_job || '',
        date_applied: client?.date_applied || '',

        // Birth & family
        place_of_birth: client?.place_of_birth || '',
        date_of_birth: client?.date_of_birth || '',
        mothers_maiden_name: client?.mothers_maiden_name || '',
        fathers_name: client?.fathers_name || '',
        nationality: client?.nationality || '',
        religion: client?.religion || '',
        sector_sub_caste: client?.sector_sub_caste || '',

        // Position
        current_position: client?.current_position || '',
        position_applied_for: client?.position_applied_for || '',
        educational_attainment: client?.educational_attainment || '',
        last_salary: client?.last_salary || '',
        expected_salary: client?.expected_salary || '',
        e_registration_number: client?.e_registration_number || '',

        // Physical details
        body_weight_bmi: client?.body_weight_bmi || '',
        height_cm: client?.height_cm || '',
        coverall_shoe_size: client?.coverall_shoe_size || '',
        safety_shoe_size: client?.safety_shoe_size || '',
        boiler_suit_size: client?.boiler_suit_size || '',

        // Contact & address
        current_home_address: client?.current_home_address || '',
        personal_mobile_no: client?.personal_mobile_no || '',
        telephone_numbers: client?.telephone_numbers || '',
        whatsapp_number: client?.whatsapp_number || '',
        fax_no: client?.fax_no || '',
        email_address: client?.email_address || client?.email || '',
        nearest_airport: client?.nearest_airport || '',

        // Next of kin / emergency
        next_of_kin: client?.next_of_kin || '',
        relationship: client?.relationship || '',
        wife_name: client?.wife_name || '',
        wife_ic_no: client?.wife_ic_no || '',
        wife_occupation: client?.wife_occupation || '',
        marriage_date: client?.marriage_date || '',
        wife_income_tax_no: client?.wife_income_tax_no || '',
        contact_person: client?.contact_person || '',
        emergency_contact: client?.emergency_contact || '',

        // Government IDs
        sss_no: client?.sss_no || '',
        pagibig_no: client?.pagibig_no || '',
        epf_no: client?.epf_no || '',
        socso_no: client?.socso_no || '',
        blood: client?.blood || '',
        philhealth_no: client?.philhealth_no || '',
        // Avatar
        avatar: null,
        resume_attachment: null,
        privacy_act_accepted: Boolean(client?.privacy_act_accepted),
    });

    function submit(e) {
        e.preventDefault();
        transform(({ avatar, resume_attachment, ...payload }) => ({
            ...payload,
            ...(avatar instanceof File ? { avatar } : {}),
            ...(resume_attachment instanceof File ? { resume_attachment } : {}),
        }));
        post('/seafarers/continue', {
            onError: (errorsResp) => {
                const msgs = Object.values(errorsResp || {}).flat();
                const message = msgs.length ? msgs.join('\n') : 'Please fix the highlighted fields.';
                setModalType('error');
                setModalMessage(message);
                setModalOpen(true);
            },
            onSuccess: (page) => {
                const pNotice = page.props?.flash?.notice;
                if (pNotice) {
                    setModalType('success');
                    setModalMessage(pNotice);
                    setModalOpen(true);
                }
            }
        });
    }

    function handleAvatarChange(e) {
        const file = e.target.files[0] ?? null;

        setData('avatar', file);
        setAvatarPreview(file ? URL.createObjectURL(file) : null);
    }

    useEffect(() => {
        if (notice) {
            setModalType('success');
            setModalMessage(notice);
            setModalOpen(true);
        }
    }, [notice]);

    useEffect(() => {
        if (errors.profile) {
            setModalType('error');
            setModalMessage(errors.profile);
            setModalOpen(true);
        }
    }, [errors.profile]);

    useEffect(() => () => {
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }
    }, [avatarPreview]);

    const fieldProps = { data, errors, setData };

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10"
            style={{ backgroundColor: PALETTE.paper, fontFamily: "'Inter', sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
            `}</style>

            <div className="flex items-center gap-2 mb-8">
                {logoUrl ? (
                    <img src={logoUrl} alt={company.company_name || company.portal_name || 'Company'} className="h-8 w-8 rounded bg-white object-contain p-1" />
                ) : (
                    <AnchorIcon />
                )}
                <p
                    className="text-xl"
                    style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
                >
                    {company.portal_name || 'Anchor Point'}
                </p>
            </div>

            {/* progress hint, mirrors the registration step tracker */}
            <div className="flex items-center gap-2 mb-8 text-xs" style={{ color: PALETTE.sub }}>
                <span style={{ color: PALETTE.teal }}>Account</span>
                <span>—</span>
                <span style={{ color: PALETTE.teal }}>Verify</span>
                <span>—</span>
                <span style={{ color: PALETTE.ink, fontWeight: 600 }}>Profile</span>
                <span>—</span>
                <span>Dashboard</span>
            </div>

            <div className="w-full max-w-4xl">
                {notice && (
                    <div className="mb-4 px-4 py-3 rounded text-sm" style={{ backgroundColor: PALETTE.tealBg, color: PALETTE.navy }}>
                        {notice}
                    </div>
                )}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
                        <div className="relative max-w-lg w-full mx-4 p-6 rounded shadow-lg" style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}>
                            <div className="flex items-start gap-3">
                                <div style={{ width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: modalType === 'success' ? PALETTE.tealBg : '#FCEAEA' }}>
                                    {modalType === 'success' ? (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke={PALETTE.teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke="#A23E34" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17h.01" stroke="#A23E34" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#A23E34" strokeWidth="1.6"/></svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold" style={{ color: PALETTE.ink }}>{modalType === 'success' ? 'Success' : 'Error'}</h3>
                                    <p className="text-sm mt-2" style={{ color: PALETTE.sub, whiteSpace: 'pre-line' }}>{modalMessage}</p>
                                    <div className="mt-4 text-right">
                                        <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded text-sm" style={{ backgroundColor: PALETTE.navy, color: '#F4F1E8' }}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div
                    className="rounded p-6 sm:p-8"
                    style={{ backgroundColor: PALETTE.card, border: `1px solid ${PALETTE.line}` }}
                >
                    <h1
                        className="text-2xl mb-1 text-center"
                        style={{ fontFamily: "'Fraunces', serif", color: PALETTE.ink, fontWeight: 600 }}
                    >
                        Complete your profile
                    </h1>
                    <p className="text-sm text-center mb-2" style={{ color: PALETTE.sub }}>
                        Finish your personal details to access the client dashboard.
                    </p>
                    <p className="text-xs text-center mb-4" style={{ color: PALETTE.sub }}>
                        Please make sure the information you give is accurate and complete. All information
                        submitted is encrypted and used only for application and filing purposes.
                    </p>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center">
                            <div>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Selected profile photo preview" className="w-20 h-20 rounded-full object-cover border" />
                                ) : client?.avatar ? (
                                    <img src={`/storage/${client.avatar}`} alt="avatar" className="w-20 h-20 rounded-full object-cover border" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: PALETTE.tealBg, color: PALETTE.teal }}>{(client?.first_name||'C')[0]}{(client?.last_name||'L')[0]}</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm mb-1">Profile photo</label>
                                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                                {errors.avatar && <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors.avatar}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm mb-1">Resume attachment <span style={{ color: PALETTE.rust }}>*</span></label>
                                {client?.resume_attachment && (
                                    <a
                                        href={route('seafarers.resume.view')}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mb-2 block text-sm underline"
                                        style={{ color: PALETTE.teal }}
                                    >
                                        View current resume
                                    </a>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,image/*"
                                    required={!client?.resume_attachment}
                                    onChange={(e) => setData('resume_attachment', e.target.files[0] ?? null)}
                                />
                                {errors.resume_attachment && <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors.resume_attachment}</p>}
                            </div>
                        </div>
                        <SectionTitle>Personal Information</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field {...fieldProps} label="First name" name="first_name" required />
                            <Field {...fieldProps} label="Middle name" name="middle_name" />
                            <Field {...fieldProps} label="Last name" name="last_name" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field {...fieldProps} label="Gender" name="gender" type="select" options={GENDER_OPTIONS} />
                            <Field {...fieldProps} label="Status" name="status" type="select" options={STATUS_OPTIONS} />
                            <Field {...fieldProps} label="Position applied for" name="position_applied_for" required />
                            <Field {...fieldProps} label="Type of job" name="type_of_job" type="select" options={TYPE_OF_JOB_OPTIONS} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field {...fieldProps} label="Date applied" name="date_applied" type="date" required />
                            <Field {...fieldProps} label="Nationality" name="nationality" required />
                        </div>

                        <SectionTitle>Birth &amp; family details</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field {...fieldProps} label="Place of birth" name="place_of_birth" required />
                            <Field {...fieldProps} label="Date of birth" name="date_of_birth" type="date" required />
                            <Field {...fieldProps} label="Mother's maiden name" name="mothers_maiden_name" required />
                            <Field {...fieldProps} label="Father's name" name="fathers_name" required />
                            <Field {...fieldProps} label="Religion" name="religion" />
                            <Field {...fieldProps} label="Sector / Sub caste" name="sector_sub_caste" />
                        </div>

                        <SectionTitle>Position &amp; background</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field {...fieldProps} label="Current position" name="current_position" required />
                            <Field {...fieldProps} label="Educational attainment" name="educational_attainment" required />
                            <Field {...fieldProps} label="Last salary" name="last_salary" />
                            <Field {...fieldProps} label="Expected salary" name="expected_salary" />
                            <Field {...fieldProps} label="E-registration number" name="e_registration_number" />
                        </div>

                        <SectionTitle>Physical details</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field {...fieldProps} label="Body weight (lbs)" name="body_weight_bmi" required />
                            <Field {...fieldProps} label="Height (cm)" name="height_cm" type="number" required />
                            <Field {...fieldProps} label="Coverall & shoe size" name="coverall_shoe_size" required />
                            <Field {...fieldProps} label="Safety shoe size" name="safety_shoe_size" />
                            <Field {...fieldProps} label="Boiler suit size" name="boiler_suit_size" />
                        </div>

                        <SectionTitle>Contact &amp; address</SectionTitle>
                        <div>
                            <label className="block text-sm mb-1" style={{ color: PALETTE.ink }}>
                                Current home address
                            </label>
                            <textarea
                                id="field-current_home_address"
                                name="current_home_address"
                                value={data.current_home_address}
                                onChange={(e) => setData('current_home_address', e.target.value)}
                                placeholder="Street, city, country"
                                rows={3}
                                className="w-full px-3 py-2 rounded text-sm outline-none resize-none"
                                style={fieldStyle(errors.current_home_address)}
                                required
                            />
                            {errors.current_home_address && (
                                <p className="text-xs mt-1" style={{ color: PALETTE.rust }}>{errors.current_home_address}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field {...fieldProps} label="Personal mobile no." name="personal_mobile_no" placeholder="(555) 010-0192" required />
                            <Field {...fieldProps} label="Telephone numbers" name="telephone_numbers" />
                            <Field {...fieldProps} label="WhatsApp number" name="whatsapp_number" />
                            <Field {...fieldProps} label="Fax no." name="fax_no" />
                            <Field {...fieldProps} label="Email address" name="email_address" type="email" required />
                            <Field {...fieldProps} label="Nearest airport" name="nearest_airport" required />
                        </div>

                        <SectionTitle>Next of kin / emergency contact</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field {...fieldProps} label="Next of kin" name="next_of_kin" required />
                            <Field {...fieldProps} label="Relationship" name="relationship" required />
                            <Field {...fieldProps} label="Emergency contact person" name="contact_person" required />
                            <Field {...fieldProps} label="Emergency contact number" name="emergency_contact" required />
                        </div>

                        <SectionTitle>Spouse details</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field {...fieldProps} label="Wife name" name="wife_name" />
                            <Field {...fieldProps} label="Wife I/C No" name="wife_ic_no" />
                            <Field {...fieldProps} label="Wife's occupation" name="wife_occupation" />
                            <Field {...fieldProps} label="Marriage date" name="marriage_date" type="date" />
                            <Field {...fieldProps} label="Wife's income tax no" name="wife_income_tax_no" />
                        </div>

                        <SectionTitle>Government IDs</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field {...fieldProps} label="SSS No." name="sss_no" required />
                            <Field {...fieldProps} label="Pag-IBIG No." name="pagibig_no" required />
                            <Field {...fieldProps} label="EPF No" name="epf_no" />
                            <Field {...fieldProps} label="SOCSO No" name="socso_no" />
                            <Field {...fieldProps} label="Blood" name="blood" />
                            <Field {...fieldProps} label="PhilHealth No." name="philhealth_no" required />
                        </div>

                        <div
                            className="rounded p-4"
                            style={{ border: `1px solid ${errors.privacy_act_accepted ? PALETTE.rust : PALETTE.line}`, backgroundColor: PALETTE.paper }}
                        >
                            <label className="flex items-start gap-3 text-sm" style={{ color: PALETTE.ink }}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(data.privacy_act_accepted)}
                                    onChange={(e) => setData('privacy_act_accepted', e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300"
                                    required
                                />
                                <span>
                                    I have read, understood, and agree that the personal information and documents I provided may be collected,
                                    processed, stored, verified, and used for recruitment, employment processing, and record management in
                                    accordance with the Data Privacy Act.
                                </span>
                            </label>
                            {errors.privacy_act_accepted && (
                                <p className="text-xs mt-2" style={{ color: PALETTE.rust }}>{errors.privacy_act_accepted}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 rounded text-sm font-medium mt-6"
                            style={{ backgroundColor: PALETTE.navy, color: '#F4F1E8', opacity: processing ? 0.6 : 1 }}
                        >
                            {processing ? 'Saving…' : 'Continue to dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
