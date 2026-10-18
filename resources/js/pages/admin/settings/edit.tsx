import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Award,
    BookOpenText,
    Building2,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Contact,
    Camera,
    Globe2,
    GraduationCap,
    Image,
    Mail,
    MapPin,
    Phone,
    Save,
    SlidersHorizontal,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';
import {
    useRef,
    useState,
    useEffect,
    type KeyboardEvent,
    type PropsWithChildren,
} from 'react';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { SchoolHistoryEditor } from '@/components/school-history-editor';
import { SettingsImageUpload } from '@/components/settings-image-upload';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { update } from '@/routes/admin/settings';
import type { SchoolHistoryItem, SiteSettings } from '@/types';

type SettingsEditProps = {
    settings: SiteSettings;
    historyEntries: SchoolHistoryItem[];
};

const settingsTabs = [
    {
        id: 'identity',
        label: 'Identitas',
        description: 'Nama dan logo sekolah',
        icon: Building2,
        fields: ['school_name', 'npsn', 'headmaster_name', 'logo'],
    },
    {
        id: 'homepage',
        label: 'Beranda',
        description: 'Foto dan sambutan',
        icon: Image,
        fields: [
            'hero_image',
            'headmaster_photo',
            'registration_url',
            'headmaster_message',
        ],
    },
    {
        id: 'statistics',
        label: 'Statistik',
        description: 'Angka dan akreditasi',
        icon: UsersRound,
        fields: [
            'alumni_count',
            'active_students_count',
            'teacher_staff_count',
            'accreditation',
        ],
    },
    {
        id: 'profile',
        label: 'Profil & Program',
        description: 'Cerita dan arah sekolah',
        icon: BookOpenText,
        fields: [
            'school_description',
            'profile_image',
            'remove_profile_image',
            'history_entries',
            'history_editor',
            'school_history',
            'school_vision',
            'school_mission',
            'school_facilities',
            'school_extracurriculars',
        ],
    },
    {
        id: 'contact',
        label: 'Kontak',
        description: 'Alamat dan komunikasi',
        icon: Contact,
        fields: ['school_email', 'school_phone', 'school_address'],
    },
    {
        id: 'links',
        label: 'Tautan Publik',
        description: 'Media sosial dan peta',
        icon: Globe2,
        fields: ['facebook_url', 'instagram_url', 'map_embed_url'],
    },
] as const;

type SettingsTabId = (typeof settingsTabs)[number]['id'];

export default function SettingsEdit({
    settings,
    historyEntries,
}: SettingsEditProps) {
    const [activeTab, setActiveTab] = useState<SettingsTabId>('identity');
    const [verticalTabs, setVerticalTabs] = useState(false);
    const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
    const [savedVersion, setSavedVersion] = useState(0);
    const settingsContent = useRef<HTMLDivElement>(null);
    const tabButtons = useRef<
        Partial<Record<SettingsTabId, HTMLButtonElement | null>>
    >({});

    useEffect(() => {
        const breakpoint = window.matchMedia('(min-width: 80rem)');
        const updateOrientation = () => setVerticalTabs(breakpoint.matches);
        updateOrientation();
        breakpoint.addEventListener('change', updateOrientation);
        return () =>
            breakpoint.removeEventListener('change', updateOrientation);
    }, []);

    function notifyFormChange() {
        requestAnimationFrame(() => {
            settingsContent.current?.dispatchEvent(
                new Event('input', { bubbles: true }),
            );
        });
    }

    function handleTabKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) {
        let nextIndex: number;
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (index + 1) % settingsTabs.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex =
                    (index - 1 + settingsTabs.length) % settingsTabs.length;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = settingsTabs.length - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        const nextTab = settingsTabs[nextIndex].id;
        setActiveTab(nextTab);
        tabButtons.current[nextTab]?.focus({ preventScroll: true });
        tabButtons.current[nextTab]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        });
    }

    function revealValidationErrors(errors: Record<string, string>) {
        const invalidTab = settingsTabs.find((tab) =>
            tab.fields.some((field) =>
                Object.keys(errors).some(
                    (key) => key === field || key.startsWith(field + '.'),
                ),
            ),
        );
        if (!invalidTab) return;
        setActiveTab(invalidTab.id);
        const invalidField = Object.keys(errors).find((key) =>
            invalidTab.fields.some(
                (field) => key === field || key.startsWith(field + '.'),
            ),
        );
        requestAnimationFrame(() => {
            const input = settingsContent.current?.querySelector<HTMLElement>(
                '[id="' + invalidField + '"]',
            );
            input?.focus({ preventScroll: true });
            const target =
                input?.closest('label') ?? input?.parentElement ?? input;
            target?.scrollIntoView({ block: 'center' });
        });
    }

    function updateImageError(field: string, error: string | null) {
        setImageErrors((current) => {
            const next = { ...current };
            if (error) next[field] = error;
            else delete next[field];
            return next;
        });
    }

    return (
        <AdminLayout active="settings" title="Pengaturan Situs">
            <Head title="Pengaturan Situs" />
            <PageTransition>
                <PageHeader
                    title="Pengaturan situs"
                    description="Satu tempat untuk mengatur wajah dan informasi publik sekolah."
                    action={
                        <Link
                            href={home()}
                            className={cn(
                                buttonVariants({ variant: 'secondary' }),
                                'gap-2 text-xs',
                            )}
                        >
                            <Globe2 aria-hidden="true" className="size-4" />
                            Lihat situs
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-3.5"
                            />
                        </Link>
                    }
                />
                <Form
                    {...update.form()}
                    encType="multipart/form-data"
                    className="max-w-6xl"
                    noValidate
                    disableWhileProcessing
                    options={{ preserveScroll: true }}
                    setDefaultsOnSuccess
                    onBefore={() => {
                        if (Object.keys(imageErrors).length > 0) {
                            revealValidationErrors(imageErrors);
                            return false;
                        }
                    }}
                    onError={revealValidationErrors}
                    onSuccess={async () => {
                        setImageErrors({});
                        setSavedVersion((version) => version + 1);
                        await new Promise<void>((resolve) =>
                            requestAnimationFrame(() => resolve()),
                        );
                    }}
                >
                    {({
                        errors: serverErrors,
                        clearErrors,
                        isDirty,
                        processing,
                        progress,
                        recentlySuccessful,
                    }) => {
                        const errors = { ...serverErrors, ...imageErrors };
                        const hasErrors = Object.keys(errors).length > 0;
                        const changed = isDirty;
                        const handleImageValidation = (
                            field: string,
                            error: string | null,
                        ) => {
                            updateImageError(field, error);
                            if (!error) clearErrors(field);
                        };

                        return (
                            <div
                                ref={settingsContent}
                                className="grid min-w-0 items-start gap-6 xl:grid-cols-[13rem_minmax(0,1fr)]"
                            >
                                <aside className="sticky top-16 z-10 -mx-4 min-w-0 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:mx-0 sm:px-0 xl:top-24 xl:border-0 xl:py-0">
                                    <div className="mb-5 hidden items-center gap-2 px-3 text-xs font-semibold text-slate-400 xl:flex">
                                        <SlidersHorizontal
                                            aria-hidden="true"
                                            className="size-3.5"
                                        />
                                        Pengaturan publik
                                    </div>
                                    <div
                                        role="tablist"
                                        aria-label="Kelompok pengaturan situs"
                                        aria-orientation={
                                            verticalTabs
                                                ? 'vertical'
                                                : 'horizontal'
                                        }
                                        className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0 [&::-webkit-scrollbar]:hidden"
                                    >
                                        {settingsTabs.map((tab, index) => {
                                            const Icon = tab.icon;
                                            const selected =
                                                activeTab === tab.id;
                                            const errorCount = Object.keys(
                                                errors,
                                            ).filter((key) =>
                                                tab.fields.some(
                                                    (field) =>
                                                        key === field ||
                                                        key.startsWith(
                                                            field + '.',
                                                        ),
                                                ),
                                            ).length;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    ref={(button) => {
                                                        tabButtons.current[
                                                            tab.id
                                                        ] = button;
                                                    }}
                                                    id={
                                                        'settings-tab-' + tab.id
                                                    }
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={selected}
                                                    aria-controls={
                                                        'settings-panel-' +
                                                        tab.id
                                                    }
                                                    tabIndex={selected ? 0 : -1}
                                                    onClick={() =>
                                                        setActiveTab(tab.id)
                                                    }
                                                    onKeyDown={(event) =>
                                                        handleTabKeyDown(
                                                            event,
                                                            index,
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 xl:w-full',
                                                        selected
                                                            ? 'border-brand-200 bg-white text-brand-700 shadow-[0_4px_12px_-8px_rgba(30,64,175,0.2)]'
                                                            : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-900',
                                                    )}
                                                >
                                                    <Icon
                                                        aria-hidden="true"
                                                        className="size-4 shrink-0"
                                                    />
                                                    <span className="flex-1">
                                                        <span className="block text-xs font-bold whitespace-nowrap sm:text-sm">
                                                            {tab.label}
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'mt-1 hidden text-[11px] font-normal xl:block',
                                                                selected
                                                                    ? 'text-brand-600/70'
                                                                    : 'text-slate-400',
                                                            )}
                                                        >
                                                            {tab.description}
                                                        </span>
                                                    </span>
                                                    {errorCount > 0 ? (
                                                        <span className="grid min-w-5 place-items-center rounded-md bg-red-50 px-1 text-xs font-bold text-red-600">
                                                            {errorCount}
                                                            <span className="sr-only">
                                                                {' '}
                                                                kolom perlu
                                                                diperbaiki
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <ChevronRight
                                                            aria-hidden="true"
                                                            className={cn(
                                                                'hidden size-3.5 xl:block',
                                                                selected
                                                                    ? 'text-brand-500'
                                                                    : 'text-slate-300',
                                                            )}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-7 hidden px-3 text-xs leading-6 text-slate-400 xl:block">
                                        Perubahan pada semua tab diterapkan
                                        setelah Anda menyimpan pengaturan.
                                    </p>
                                </aside>
                                <div className="min-w-0 space-y-5">
                                    {hasErrors && (
                                        <p
                                            role="alert"
                                            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                                        >
                                            <CircleAlert
                                                aria-hidden="true"
                                                className="mt-0.5 size-4 shrink-0"
                                            />
                                            Periksa kolom yang ditandai pada tab
                                            dengan indikator merah.
                                        </p>
                                    )}
                                    <SettingsSection
                                        tab="identity"
                                        active={activeTab === 'identity'}
                                        icon={Building2}
                                        title="Identitas sekolah"
                                        description="Informasi yang menjadi pengenal sekolah di seluruh halaman publik."
                                        number="01"
                                    >
                                        <div className="grid items-start gap-8 @lg:grid-cols-[minmax(0,1fr)_12rem]">
                                            <div className="space-y-6">
                                                <SettingsField
                                                    field="school_name"
                                                    label="Nama sekolah"
                                                    settings={settings}
                                                    errors={errors}
                                                    required
                                                    hint="Gunakan nama resmi sekolah."
                                                />
                                                <SettingsField
                                                    field="npsn"
                                                    label="NPSN"
                                                    settings={settings}
                                                    errors={errors}
                                                    hint="Nomor Pokok Sekolah Nasional."
                                                />
                                                <SettingsField
                                                    field="headmaster_name"
                                                    label="Nama kepala sekolah"
                                                    settings={settings}
                                                    errors={errors}
                                                />
                                            </div>
                                            <SettingsImageUpload
                                                key={'logo-' + savedVersion}
                                                id="logo"
                                                name="logo"
                                                label="Logo sekolah"
                                                currentUrl={settings.logo_url}
                                                error={errors.logo}
                                                maxSizeMb={2}
                                                fit="contain"
                                                aspect="square"
                                                className="max-w-56 @lg:max-w-none"
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                disabled={processing}
                                                description="Gunakan logo dengan latar transparan atau bersih."
                                                onValidationError={(error) =>
                                                    handleImageValidation(
                                                        'logo',
                                                        error,
                                                    )
                                                }
                                            />
                                        </div>
                                    </SettingsSection>
                                    <SettingsSection
                                        tab="homepage"
                                        active={activeTab === 'homepage'}
                                        icon={Image}
                                        title="Tampilan beranda"
                                        description="Foto dan pesan yang menyambut pengunjung situs sekolah."
                                        number="02"
                                    >
                                        <div className="space-y-8">
                                            <div className="grid items-start gap-6 @lg:grid-cols-[minmax(0,1fr)_11rem]">
                                                <SettingsImageUpload
                                                    key={'hero-' + savedVersion}
                                                    id="hero_image"
                                                    name="hero_image"
                                                    label="Foto hero"
                                                    currentUrl={
                                                        settings.hero_image_url
                                                    }
                                                    error={errors.hero_image}
                                                    aspect="wide"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    disabled={processing}
                                                    description="Foto kegiatan atau suasana sekolah untuk bagian utama beranda."
                                                    onValidationError={(
                                                        error,
                                                    ) =>
                                                        handleImageValidation(
                                                            'hero_image',
                                                            error,
                                                        )
                                                    }
                                                />
                                                <SettingsImageUpload
                                                    key={
                                                        'headmaster-' +
                                                        savedVersion
                                                    }
                                                    id="headmaster_photo"
                                                    name="headmaster_photo"
                                                    label="Foto kepala sekolah"
                                                    currentUrl={
                                                        settings.headmaster_photo_url
                                                    }
                                                    error={
                                                        errors.headmaster_photo
                                                    }
                                                    aspect="portrait"
                                                    className="max-w-56 @lg:max-w-none"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    disabled={processing}
                                                    onValidationError={(
                                                        error,
                                                    ) =>
                                                        handleImageValidation(
                                                            'headmaster_photo',
                                                            error,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <SettingsGroup
                                                title="Sambutan kepala sekolah"
                                                description="Pesan singkat untuk siswa, orang tua, dan pengunjung."
                                            >
                                                <SettingsField
                                                    field="headmaster_message"
                                                    label="Isi sambutan"
                                                    settings={settings}
                                                    errors={errors}
                                                    rows={6}
                                                    placeholder="Tuliskan sambutan kepala sekolah..."
                                                />
                                            </SettingsGroup>
                                            <SettingsGroup
                                                title="Pendaftaran siswa baru"
                                                description="Arahkan pengunjung ke layanan pendaftaran sekolah."
                                            >
                                                <SettingsField
                                                    field="registration_url"
                                                    label="Tautan pendaftaran"
                                                    settings={settings}
                                                    errors={errors}
                                                    type="url"
                                                    icon={ArrowUpRight}
                                                    placeholder="https://..."
                                                    hint="Jika kosong, tombol Daftar siswa baru menuju halaman Kontak."
                                                />
                                            </SettingsGroup>
                                        </div>
                                    </SettingsSection>
                                    <SettingsSection
                                        tab="statistics"
                                        active={activeTab === 'statistics'}
                                        icon={UsersRound}
                                        title="Statistik sekolah"
                                        description="Tampilkan angka resmi dan akreditasi sekolah di beranda."
                                        number="03"
                                    >
                                        <div className="grid gap-4 @lg:grid-cols-2">
                                            {(
                                                [
                                                    [
                                                        'alumni_count',
                                                        'Jumlah alumni',
                                                        GraduationCap,
                                                        'Alumni yang telah menyelesaikan pendidikan.',
                                                    ],
                                                    [
                                                        'active_students_count',
                                                        'Siswa aktif',
                                                        UsersRound,
                                                        'Siswa yang sedang belajar di sekolah.',
                                                    ],
                                                    [
                                                        'teacher_staff_count',
                                                        'Guru dan tendik',
                                                        BookOpenText,
                                                        'Total guru dan tenaga kependidikan.',
                                                    ],
                                                ] as const
                                            ).map(
                                                ([
                                                    field,
                                                    label,
                                                    Icon,
                                                    hint,
                                                ]) => (
                                                    <div
                                                        key={field}
                                                        className="space-y-5 rounded-2xl bg-slate-50 p-5"
                                                    >
                                                        <Icon
                                                            aria-hidden="true"
                                                            className="size-5 text-brand-500"
                                                        />
                                                        <SettingsField
                                                            field={field}
                                                            label={label}
                                                            settings={settings}
                                                            errors={errors}
                                                            type="number"
                                                            hint={hint}
                                                            placeholder="—"
                                                            large
                                                        />
                                                    </div>
                                                ),
                                            )}
                                            <div className="space-y-5 rounded-2xl bg-slate-50 p-5">
                                                <Award
                                                    aria-hidden="true"
                                                    className="size-5 text-brand-500"
                                                />
                                                <SettingsField
                                                    field="accreditation"
                                                    label="Akreditasi"
                                                    settings={settings}
                                                    errors={errors}
                                                    placeholder="A / Unggul"
                                                    hint="Predikat akreditasi terbaru sekolah."
                                                    large
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-6 text-xs leading-6 text-slate-500">
                                            Kosongkan kolom jika data belum
                                            tersedia. Angka diperbarui secara
                                            manual sesuai data sekolah.
                                        </p>
                                    </SettingsSection>
                                    <SettingsSection
                                        tab="profile"
                                        active={activeTab === 'profile'}
                                        icon={BookOpenText}
                                        title="Profil dan program"
                                        description="Ceritakan sekolah, arah pendidikan, dan perjalanan yang membentuknya."
                                        number="04"
                                    >
                                        <div className="space-y-8">
                                            <div className="grid items-start gap-6 @lg:grid-cols-2">
                                                <SettingsImageUpload
                                                    key={
                                                        'profile-' +
                                                        savedVersion
                                                    }
                                                    id="profile_image"
                                                    name="profile_image"
                                                    removeName="remove_profile_image"
                                                    label="Foto halaman profil"
                                                    currentUrl={
                                                        settings.profile_image_url
                                                    }
                                                    error={errors.profile_image}
                                                    aspect="wide"
                                                    disabled={processing}
                                                    description="Foto sampul untuk memperkenalkan lingkungan sekolah."
                                                    onChange={notifyFormChange}
                                                    onValidationError={(
                                                        error,
                                                    ) =>
                                                        handleImageValidation(
                                                            'profile_image',
                                                            error,
                                                        )
                                                    }
                                                />
                                                <SettingsField
                                                    field="school_description"
                                                    label="Deskripsi singkat"
                                                    settings={settings}
                                                    errors={errors}
                                                    rows={4}
                                                    required
                                                    hint="Perkenalkan karakter dan lingkungan belajar sekolah."
                                                />
                                            </div>
                                            <SettingsGroup
                                                title="Visi dan misi"
                                                description="Tujuan sekolah dan langkah untuk mencapainya."
                                            >
                                                <div className="grid gap-6 @lg:grid-cols-2">
                                                    <SettingsField
                                                        field="school_vision"
                                                        label="Visi"
                                                        settings={settings}
                                                        errors={errors}
                                                        rows={5}
                                                    />
                                                    <SettingsField
                                                        field="school_mission"
                                                        label="Misi"
                                                        settings={settings}
                                                        errors={errors}
                                                        rows={5}
                                                        hint="Tuliskan satu butir misi per baris."
                                                    />
                                                </div>
                                            </SettingsGroup>
                                            <SettingsGroup
                                                title="Fasilitas dan kegiatan"
                                                description="Sarana belajar dan ruang pengembangan minat siswa."
                                            >
                                                <div className="grid gap-6 @lg:grid-cols-2">
                                                    <SettingsField
                                                        field="school_facilities"
                                                        label="Fasilitas"
                                                        settings={settings}
                                                        errors={errors}
                                                        rows={5}
                                                        hint="Tuliskan satu fasilitas per baris."
                                                    />
                                                    <SettingsField
                                                        field="school_extracurriculars"
                                                        label="Ekstrakurikuler"
                                                        settings={settings}
                                                        errors={errors}
                                                        rows={5}
                                                        hint="Tuliskan satu kegiatan per baris."
                                                    />
                                                </div>
                                            </SettingsGroup>
                                            <SettingsGroup
                                                title="Sejarah singkat"
                                                description="Ringkasan perjalanan sekolah sebelum cerita sejarah diterbitkan."
                                            >
                                                <SettingsField
                                                    field="school_history"
                                                    label="Ringkasan sejarah"
                                                    settings={settings}
                                                    errors={errors}
                                                    rows={5}
                                                    hint="Tetap tampil jika belum ada cerita sejarah yang diterbitkan."
                                                />
                                            </SettingsGroup>
                                            <SchoolHistoryEditor
                                                key={
                                                    JSON.stringify(
                                                        historyEntries,
                                                    ) + savedVersion
                                                }
                                                entries={historyEntries}
                                                errors={errors}
                                                processing={processing}
                                                onChange={notifyFormChange}
                                                onPhotoError={
                                                    handleImageValidation
                                                }
                                                onStructureChange={(
                                                    photoErrors,
                                                ) => {
                                                    notifyFormChange();
                                                    setImageErrors(
                                                        (current) => ({
                                                            ...Object.fromEntries(
                                                                Object.entries(
                                                                    current,
                                                                ).filter(
                                                                    ([field]) =>
                                                                        !field.startsWith(
                                                                            'history_entries.',
                                                                        ),
                                                                ),
                                                            ),
                                                            ...photoErrors,
                                                        }),
                                                    );
                                                    clearErrors(
                                                        ...Object.keys(
                                                            serverErrors,
                                                        ).filter(
                                                            (key) =>
                                                                key ===
                                                                    'history_entries' ||
                                                                key.startsWith(
                                                                    'history_entries.',
                                                                ),
                                                        ),
                                                    );
                                                }}
                                            />
                                        </div>
                                    </SettingsSection>
                                    <SettingsSection
                                        tab="contact"
                                        active={activeTab === 'contact'}
                                        icon={Contact}
                                        title="Kontak sekolah"
                                        description="Bantu orang tua dan masyarakat terhubung dengan sekolah."
                                        number="05"
                                    >
                                        <div className="space-y-8">
                                            <div className="grid gap-6 @lg:grid-cols-2">
                                                <SettingsField
                                                    field="school_email"
                                                    label="Email resmi"
                                                    settings={settings}
                                                    errors={errors}
                                                    type="email"
                                                    icon={Mail}
                                                    required
                                                    placeholder="nama@sekolah.sch.id"
                                                />
                                                <SettingsField
                                                    field="school_phone"
                                                    label="Nomor telepon"
                                                    settings={settings}
                                                    errors={errors}
                                                    type="tel"
                                                    icon={Phone}
                                                    required
                                                    placeholder="Nomor yang dapat dihubungi"
                                                />
                                            </div>
                                            <SettingsGroup
                                                title="Alamat sekolah"
                                                description="Alamat resmi ditampilkan pada halaman Kontak dan footer."
                                            >
                                                <SettingsField
                                                    field="school_address"
                                                    label="Alamat lengkap"
                                                    settings={settings}
                                                    errors={errors}
                                                    rows={4}
                                                    required
                                                    placeholder="Jalan, desa atau kelurahan, kecamatan, kabupaten..."
                                                />
                                            </SettingsGroup>
                                        </div>
                                    </SettingsSection>
                                    <SettingsSection
                                        tab="links"
                                        active={activeTab === 'links'}
                                        icon={Globe2}
                                        title="Tautan publik"
                                        description="Hubungkan situs dengan media sosial dan lokasi resmi sekolah."
                                        number="06"
                                    >
                                        <div className="space-y-8">
                                            <div className="grid gap-6 @lg:grid-cols-2">
                                                <SettingsField
                                                    field="facebook_url"
                                                    label="Facebook"
                                                    settings={settings}
                                                    errors={errors}
                                                    type="url"
                                                    icon={Globe2}
                                                    placeholder="https://facebook.com/..."
                                                    hint="Tautan halaman resmi sekolah."
                                                />
                                                <SettingsField
                                                    field="instagram_url"
                                                    label="Instagram"
                                                    settings={settings}
                                                    errors={errors}
                                                    type="url"
                                                    icon={Camera}
                                                    placeholder="https://instagram.com/..."
                                                    hint="Tautan profil Instagram sekolah."
                                                />
                                            </div>
                                            <SettingsGroup
                                                title="Lokasi di peta"
                                                description="Bantu pengunjung menemukan titik lokasi sekolah."
                                            >
                                                <SettingsField
                                                    field="map_embed_url"
                                                    label="URL sematan peta"
                                                    settings={settings}
                                                    errors={errors}
                                                    type="url"
                                                    icon={MapPin}
                                                    placeholder="https://www.google.com/maps/embed?..."
                                                    hint="Salin URL src dari fitur Sematkan peta di Google Maps. Jika kosong atau berupa tautan berbagi, peta menggunakan alamat sekolah."
                                                />
                                            </SettingsGroup>
                                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                                                <Globe2
                                                    aria-hidden="true"
                                                    className="mt-1 size-4 shrink-0 text-brand-500"
                                                />
                                                Tautan yang diisi akan tampil
                                                pada halaman publik. Kosongkan
                                                jika sekolah belum memiliki akun
                                                resmi.
                                            </div>
                                        </div>
                                    </SettingsSection>
                                    <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-200 bg-white/95 shadow-[0_8px_30px_-15px_rgba(15,23,42,0.2)] backdrop-blur">
                                        {processing && progress && (
                                            <progress
                                                aria-label="Progres unggah gambar"
                                                value={progress.percentage ?? 0}
                                                max={100}
                                                className="block h-1 w-full overflow-hidden rounded-t-2xl accent-brand-500"
                                            />
                                        )}
                                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                            <div
                                                role="status"
                                                aria-live="polite"
                                                className="flex min-w-0 items-center gap-3 text-xs"
                                            >
                                                <span
                                                    className={cn(
                                                        'grid size-9 shrink-0 place-items-center rounded-xl',
                                                        hasErrors
                                                            ? 'bg-red-50 text-red-600'
                                                            : changed
                                                              ? 'bg-amber-50 text-amber-600'
                                                              : 'bg-brand-50 text-brand-600',
                                                    )}
                                                >
                                                    {hasErrors ? (
                                                        <CircleAlert
                                                            aria-hidden="true"
                                                            className="size-4"
                                                        />
                                                    ) : (
                                                        <CheckCircle2
                                                            aria-hidden="true"
                                                            className="size-4"
                                                        />
                                                    )}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {processing
                                                            ? progress
                                                                ? 'Mengunggah gambar ' +
                                                                  (progress.percentage ??
                                                                      0) +
                                                                  '%'
                                                                : 'Menyimpan pengaturan...'
                                                            : hasErrors
                                                              ? 'Periksa kolom yang ditandai'
                                                              : recentlySuccessful &&
                                                                  !changed
                                                                ? 'Pengaturan berhasil disimpan'
                                                                : changed
                                                                  ? 'Perubahan belum disimpan'
                                                                  : 'Pengaturan siap diperbarui'}
                                                    </p>
                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Semua tab disimpan
                                                        sekaligus.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={
                                                    processing ||
                                                    Object.keys(imageErrors)
                                                        .length > 0
                                                }
                                                className="shrink-0"
                                            >
                                                <Save
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                                {processing
                                                    ? 'Menyimpan...'
                                                    : 'Simpan Semua Pengaturan'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

function SettingsSection({
    active,
    children,
    description,
    icon: Icon,
    tab,
    title,
    number,
}: PropsWithChildren<{
    active: boolean;
    description: string;
    icon: LucideIcon;
    tab: SettingsTabId;
    title: string;
    number: string;
}>) {
    return (
        <section
            id={'settings-panel-' + tab}
            role="tabpanel"
            aria-labelledby={'settings-tab-' + tab}
            hidden={!active}
            tabIndex={0}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_-18px_rgba(15,23,42,0.15)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
        >
            <header className="flex items-start justify-between gap-5 border-b border-slate-100 px-5 py-6 sm:px-7">
                <div className="flex items-start gap-3.5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon
                            aria-hidden="true"
                            className="size-5"
                            strokeWidth={1.7}
                        />
                    </span>
                    <div>
                        <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                            {title}
                        </h2>
                        <p className="mt-1.5 max-w-lg text-xs leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>
                <span
                    aria-hidden="true"
                    className="mt-1 hidden font-mono text-xs text-slate-300 sm:block"
                >
                    {number} / 06
                </span>
            </header>
            <div className="@container p-5 sm:p-7">{children}</div>
        </section>
    );
}

function SettingsGroup({
    title,
    description,
    children,
}: PropsWithChildren<{ title: string; description: string }>) {
    return (
        <section className="space-y-5 border-t border-slate-100 pt-7">
            <div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                    {description}
                </p>
            </div>
            {children}
        </section>
    );
}

function SettingsField({
    field,
    label,
    settings,
    errors,
    rows,
    type = 'text',
    icon: Icon,
    required,
    hint,
    placeholder,
    large = false,
}: {
    field: keyof SiteSettings;
    label: string;
    settings: SiteSettings;
    errors: Record<string, string>;
    rows?: number;
    type?: 'text' | 'number' | 'email' | 'tel' | 'url';
    icon?: LucideIcon;
    required?: boolean;
    hint?: string;
    placeholder?: string;
    large?: boolean;
}) {
    const common = {
        id: field,
        name: field,
        defaultValue: settings[field] ?? '',
        required,
        placeholder,
        'aria-invalid': Boolean(errors[field]),
    };
    return (
        <FormField
            htmlFor={field}
            label={label}
            error={errors[field]}
            required={required}
            hint={hint}
        >
            {rows ? (
                <Textarea
                    {...common}
                    rows={rows}
                    className="rounded-xl border-slate-200 leading-7"
                />
            ) : (
                <div className="relative">
                    {Icon && (
                        <Icon
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                        />
                    )}
                    <Input
                        {...common}
                        type={type}
                        min={type === 'number' ? 0 : undefined}
                        max={type === 'number' ? 10000000 : undefined}
                        step={type === 'number' ? 1 : undefined}
                        maxLength={field === 'accreditation' ? 100 : undefined}
                        className={cn(
                            'h-11 rounded-xl border-slate-200',
                            Icon && 'pl-10',
                            large &&
                                'h-14 bg-white text-xl font-semibold tabular-nums',
                        )}
                    />
                </div>
            )}
        </FormField>
    );
}
