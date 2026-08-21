import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Camera, Globe, Mail, MapPin, Phone, Save } from 'lucide-react';
import AdminTabs from '@/Components/Admin/AdminTabs';

export default function CompanySettings({ companySettings }) {
    const { data, setData, post, transform, errors, processing, recentlySuccessful, reset } = useForm({
        company_name: companySettings?.company_name || '',
        portal_name: companySettings?.portal_name || '',
        tagline: companySettings?.tagline || '',
        company_address: companySettings?.address || '',
        company_phone: companySettings?.phone || '',
        company_email: companySettings?.email || '',
        company_website: companySettings?.website || '',
        company_logo: null,
    });
    const [logoPreview, setLogoPreview] = useState(companySettings?.logo ? `/storage/${companySettings.logo}` : null);

    const handleLogoChange = (event) => {
        const file = event.target.files[0] ?? null;
        setData('company_logo', file);
        setLogoPreview(file ? URL.createObjectURL(file) : (companySettings?.logo ? `/storage/${companySettings.logo}` : null));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        transform((formData) => ({ ...formData, _method: 'put' }));
        post('/admin/company-settings', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('company_logo'),
        });
    };

    return (
        <AdminTabs activeTab="company-settings" title="Company Settings">
            <Head title="Company Settings" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-[#8A642C]">Admin console</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Company Settings</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-500">Update the company details shown across the admin portal, seafarer portal, emails, and printouts.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="rounded border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <Building2 size={19} className="text-[#1F6F5C]" />
                                Company Information
                            </h3>
                        </div>

                        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.8fr_1.4fr]">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                                    {logoPreview ? <img src={logoPreview} alt={data.company_name || 'Company logo'} className="h-full w-full object-contain" /> : 'Logo'}
                                </div>
                                <label className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                    <Camera size={16} />
                                    Upload logo
                                    <input name="company_logo" type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
                                </label>
                                {errors.company_logo && <p className="mt-2 text-sm text-red-600">{errors.company_logo}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Company name</label>
                                    <input type="text" value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Portal name</label>
                                    <input type="text" value={data.portal_name} onChange={(event) => setData('portal_name', event.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    {errors.portal_name && <p className="mt-1 text-sm text-red-600">{errors.portal_name}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700">Tagline</label>
                                    <input type="text" value={data.tagline} onChange={(event) => setData('tagline', event.target.value)} className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    {errors.tagline && <p className="mt-1 text-sm text-red-600">{errors.tagline}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700">Address</label>
                                    <div className="relative mt-1">
                                        <MapPin className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
                                        <textarea value={data.company_address} onChange={(event) => setData('company_address', event.target.value)} rows="3" className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    </div>
                                    {errors.company_address && <p className="mt-1 text-sm text-red-600">{errors.company_address}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Company email</label>
                                    <div className="relative mt-1">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input type="email" value={data.company_email} onChange={(event) => setData('company_email', event.target.value)} className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    </div>
                                    {errors.company_email && <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                                    <div className="relative mt-1">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input type="text" value={data.company_phone} onChange={(event) => setData('company_phone', event.target.value)} className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    </div>
                                    {errors.company_phone && <p className="mt-1 text-sm text-red-600">{errors.company_phone}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700">Website</label>
                                    <div className="relative mt-1">
                                        <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <input type="text" value={data.company_website} onChange={(event) => setData('company_website', event.target.value)} className="w-full rounded border border-slate-300 py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-[#B8863B] focus:ring-[#B8863B]" />
                                    </div>
                                    {errors.company_website && <p className="mt-1 text-sm text-red-600">{errors.company_website}</p>}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        {recentlySuccessful ? <p className="text-sm font-medium text-emerald-700">Company settings updated successfully.</p> : <p className="text-sm text-slate-500">Company changes apply across admin and seafarer portals.</p>}
                        <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded bg-[#0A2436] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12364F] disabled:cursor-not-allowed disabled:opacity-60">
                            <Save size={16} />
                            Save company settings
                        </button>
                    </div>
                </form>
            </div>
        </AdminTabs>
    );
}
