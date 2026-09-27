import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Anchor, ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Pause, Play, FileText, Mail, MapPin, Menu, Phone, Ship, X } from 'lucide-react';
import '../../css/homepage.css';

const HERO_SLIDES = [
    { image: '/images/homepage/cargo-vessel.jpg', alt: 'Container vessels alongside cranes at a working port', label: 'PORTS & POSSIBILITIES', title: 'Your journey starts here.' },
    { image: '/images/homepage/container-port.jpg', alt: 'Aerial view of shipping containers arranged at a cargo terminal', label: 'A CONNECTED WORLD', title: 'Experience that moves the world.' },
    { image: '/images/homepage/horizon.jpg', alt: 'Ocean waves stretching toward the horizon', label: 'OPEN HORIZONS', title: 'Set your sights on what’s next.' },
];

function HeroCarousel() {
    const [active, setActive] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPlaying(!preference.matches);
        const update = () => setPlaying(!preference.matches);
        preference.addEventListener('change', update);
        return () => preference.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (!playing || hovered) return;
        const timer = window.setInterval(() => {
            if (!document.hidden) setActive((current) => (current + 1) % HERO_SLIDES.length);
        }, 5500);
        return () => window.clearInterval(timer);
    }, [playing, hovered]);

    const goTo = (index) => {
        setPlaying(false);
        setActive((index + HERO_SLIDES.length) % HERO_SLIDES.length);
    };
    const slide = HERO_SLIDES[active];

    return (
        <section className="home-hero-art home-carousel" aria-roledescription="carousel" aria-label="Maritime highlights"
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            onFocusCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPlaying(false); }}
            onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
                }
            }}>
            {HERO_SLIDES.map((item, index) => (
                <div key={item.image} className={`home-carousel-slide ${active === index ? 'is-active' : ''}`}
                    role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${HERO_SLIDES.length}`} aria-hidden={active !== index}>
                    <img src={item.image} alt={item.alt} width="1200" height="800" fetchPriority={index === 0 ? 'high' : 'auto'} />
                </div>
            ))}
            <div className="home-carousel-shade" />
            <div className="home-art-top"><span>CHARTING WHAT COMES NEXT</span><span>{String(active + 1).padStart(2, '0')} / 03</span></div>
            <div className="home-art-card" aria-live={playing ? 'off' : 'polite'} aria-atomic="true"><span className="home-card-icon"><Ship size={23} /></span><div><small>{slide.label}</small><strong>{slide.title}</strong></div><ArrowUpRight size={23} /></div>
            <div className="home-carousel-controls">
                <div className="home-carousel-dots" role="group" aria-label="Choose a slide">
                    {HERO_SLIDES.map((item, index) => <button key={item.image} type="button" aria-label={`Show slide ${index + 1}: ${item.label}`} aria-pressed={active === index} onClick={() => goTo(index)}><span /></button>)}
                </div>
                <div className="home-carousel-buttons">
                    <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
                    <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous slide"><ChevronLeft size={20} /></button>
                    <button type="button" onClick={() => goTo(active + 1)} aria-label="Next slide"><ChevronRight size={20} /></button>
                </div>
            </div>
        </section>
    );
}

export default function Homepage() {
    const { companySettings: company = {} } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const name = company.company_name || 'ALPHA OMEGA CREWING MANAGEMENT INC';
    const portal = company.portal_name || 'Anchor Point';
    const navigation = [['About us', '#about'], ['For seafarers', '#seafarers'], ['How to apply', '#apply'], ['Contact', '#contact'], ['Inquiry', route('inquiry.create')]];
    const Brand = () => <><span className="home-brand-mark">{company.logo_url ? <img src={company.logo_url} alt={`${name} logo`} /> : <Anchor size={25} />}</span><span className="home-brand-name">{name}<small>{company.tagline || 'Crewing & recruitment'}</small></span></>;
    return (
        <div className="homepage">
            <Head title={`Home | ${name}`}><meta name="description" content={`${name}. Start your maritime application, manage your sea-service records, and keep your credentials together with ${portal}.`} /></Head>
            <a className="home-skip" href="#main">Skip to content</a>
            <div className="home-topbar"><div className="home-container"><span>PEOPLE. PURPOSE. OPEN HORIZONS.</span><a href="#contact">Based in Manila, connected to the sea <ArrowUpRight size={12} /></a></div></div>
            <header className="home-header home-container">
                <Link href={route('homepage')} className="home-brand" aria-label={`${name} home`}><Brand /></Link>
                <nav className="home-desktop-nav" aria-label="Main navigation">{navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
                <Link className="home-portal-link" href={route('seafarers.entry')}>Seafarer portal <ArrowUpRight size={16} /></Link>
                <button className="home-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="home-mobile-nav" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X /> : <Menu />}</button>
            </header>
            {menuOpen && <nav id="home-mobile-nav" className="home-mobile-nav" aria-label="Mobile navigation">{navigation.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<Link href={route('seafarers.entry')}>Seafarer portal <ArrowUpRight size={16} /></Link></nav>}
            <main id="main">
                <section className="home-hero home-container">
                    <div className="home-hero-copy">
                        <p className="home-eyebrow"><span /> YOUR NEXT CHAPTER AT SEA</p>
                        <h1>Good people.<br />Great journeys.<br /><em>One course.</em></h1>
                        <p className="home-intro">Your experience deserves a way forward. Begin your maritime application with {name} and keep your next step within reach.</p>
                        <div className="home-actions"><Link className="home-button home-button-dark" href={route('seafarers.register')}>Start your application <ArrowUpRight size={19} /></Link><a className="home-text-link" href="#about">Get to know us <ArrowRight size={17} /></a></div>
                        <div className="home-hero-note"><span><Anchor size={18} /></span><p>Built around seafarers.<br /><strong>From your first profile to your next voyage.</strong></p></div>
                    </div>
                    <HeroCarousel />
                </section>
                <div className="home-topic-strip home-container"><span>MARITIME RECRUITMENT</span><i /><span>SEAFARER PROFILES</span><i /><span>SEA SERVICE & CREDENTIALS</span><a href="#about" aria-label="Explore our approach"><ArrowDown size={18} /></a></div>
                <section id="about" className="home-about home-container home-section">
                    <div><p className="home-eyebrow">01 — WHO WE ARE</p><h2>At the heart of every<br />voyage is <em>the crew.</em></h2></div>
                    <div className="home-about-copy"><p>Crewing starts with knowing the person behind the profile. Our application process brings your experience, qualifications, and sea-service history together in one place.</p><p>Whether you are preparing your first application or updating years of experience, {portal} gives you a place to keep your maritime career information ready.</p><a href="#seafarers" className="home-text-link">Explore the seafarer portal <ArrowRight size={17} /></a></div>
                </section>
                <section id="seafarers" className="home-services"><div className="home-container home-section"><div className="home-section-heading"><div><p className="home-eyebrow">02 — FOR SEAFARERS</p><h2>Your experience.<br /><em>All together.</em></h2></div><p>A complete picture of your career,<br />ready for the next conversation.</p></div><div className="home-service-grid">{[
                    [Anchor, '01', 'A profile that tells your story', 'Bring together your personal details, rank, work experience, and the position you are applying for.'],
                    [FileText, '02', 'Credentials, kept in order', 'Record your travel documents, competency certificates, STCW courses, and offshore training.'],
                    [Ship, '03', 'Every voyage accounted for', 'Keep a clear record of your vessels, positions, sign-on and sign-off dates, and areas of operation.'],
                ].map(([Icon, number, title, description]) => <article key={number} className="home-service"><div><Icon size={29} strokeWidth={1.4} /><span>{number}</span></div><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
                <section id="apply" className="home-container home-section"><div className="home-section-heading"><div><p className="home-eyebrow">03 — YOUR FIRST STEP</p><h2>Ready when <em>you are.</em></h2></div><Link href={route('seafarers.register')} className="home-text-link">Begin your application <ArrowUpRight size={18} /></Link></div><div className="home-steps">{[
                    ['01', 'Create your account', 'Register through the seafarer portal and follow the account verification steps.'],
                    ['02', 'Complete your profile', 'Add your personal information, qualifications, sea service, and supporting documents.'],
                    ['03', 'Keep your details current', 'Return to your portal to update your records and review your application information.'],
                ].map(([number, title, description]) => <article key={number}><span className="home-step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div><div className="home-checklist"><Check size={19} /><p>Before you begin, have your résumé, travel documents, certificates, and sea-service details ready.</p></div></section>
                <section id="contact" className="home-contact"><div className="home-container"><div><p className="home-eyebrow">LET’S FIND YOUR NEXT DIRECTION</p><h2>The next horizon<br />starts <em>with you.</em></h2><Link className="home-button home-button-light" href={route('seafarers.register')}>Start your application <ArrowUpRight size={19} /></Link></div><div className="home-contact-details"><p className="home-eyebrow">GET IN TOUCH</p><h3>{name}</h3>{company.address && <div><MapPin size={19} /><p>{company.address}</p></div>}{company.email && <a href={`mailto:${company.email}`}><Mail size={18} />{company.email}</a>}{company.phone && <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}><Phone size={18} />{company.phone}</a>}<Link href={route('seafarers.login')} className="home-contact-login">Already registered? Sign in <ArrowRight size={17} /></Link></div></div></section>
            </main>
            <footer className="home-footer home-container"><Link href={route('homepage')} className="home-brand"><Brand /></Link><p>© {new Date().getFullYear()} {name}.<br />All rights reserved.</p></footer>
        </div>
    );
}
