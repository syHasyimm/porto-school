import { Form, Head } from '@inertiajs/react';
import { Building2, Contact, Globe2, Image, Save } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { FormField } from '@/components/form-field';
import { PageHeader } from '@/components/page-header';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { update } from '@/routes/admin/settings';
import type { SiteSettings } from '@/types';

type SettingsEditProps = { settings: SiteSettings };

export default function SettingsEdit({ settings }: SettingsEditProps) {
    return (
        <AdminLayout active="settings" title="Pengaturan Situs">
            <Head title="Pengaturan Situs" />
            <PageTransition>
                <PageHeader
                    title="Pengaturan situs"
                    description="Perbarui identitas, profil, program, kontak, dan tautan resmi sekolah."
                />
                <Form
                    {...update.form()}
                    encType="multipart/form-data"
                    className="max-w-5xl"
                >
                    {({ errors, processing, progress }) => (
                        <div className="space-y-6">
                            <SettingsSection
                                icon={Building2}
                                title="Identitas sekolah"
                                description="Informasi utama yang tampil pada header dan profil publik."
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        htmlFor="school_name"
                                        label="Nama sekolah"
                                        error={errors.school_name}
                                        required
                                    >
                                        <Input
                                            id="school_name"
                                            name="school_name"
                                            defaultValue={settings.school_name}
                                            required
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="npsn"
                                        label="NPSN"
                                        error={errors.npsn}
                                    >
                                        <Input
                                            id="npsn"
                                            name="npsn"
                                            defaultValue={settings.npsn ?? ''}
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="headmaster_name"
                                        label="Nama kepala sekolah"
                                        error={errors.headmaster_name}
                                    >
                                        <Input
                                            id="headmaster_name"
                                            name="headmaster_name"
                                            defaultValue={
                                                settings.headmaster_name ?? ''
                                            }
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="logo"
                                        label="Logo sekolah"
                                        error={errors.logo}
                                        hint="JPG, PNG, GIF, atau WebP, maksimal 2 MB."
                                    >
                                        <Input
                                            id="logo"
                                            name="logo"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            className="pt-2"
                                        />
                                    </FormField>
                                </div>
                                {settings.logo_url && (
                                    <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                                        <img
                                            src={settings.logo_url}
                                            alt="Logo sekolah saat ini"
                                            className="size-20 rounded-xl object-contain"
                                        />
                                        <p className="text-sm text-slate-600">
                                            Logo saat ini. Unggah berkas baru
                                            untuk menggantinya.
                                        </p>
                                    </div>
                                )}
                            </SettingsSection>

                            <SettingsSection
                                icon={Contact}
                                title="Kontak sekolah"
                                description="Data yang digunakan pada bagian kontak dan footer."
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        htmlFor="school_email"
                                        label="Email"
                                        error={errors.school_email}
                                        required
                                    >
                                        <Input
                                            id="school_email"
                                            name="school_email"
                                            type="email"
                                            defaultValue={
                                                settings.school_email ?? ''
                                            }
                                            required
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="school_phone"
                                        label="Nomor telepon"
                                        error={errors.school_phone}
                                        required
                                    >
                                        <Input
                                            id="school_phone"
                                            name="school_phone"
                                            defaultValue={
                                                settings.school_phone ?? ''
                                            }
                                            required
                                        />
                                    </FormField>
                                </div>
                                <div className="mt-5">
                                    <FormField
                                        htmlFor="school_address"
                                        label="Alamat"
                                        error={errors.school_address}
                                        required
                                    >
                                        <Textarea
                                            id="school_address"
                                            name="school_address"
                                            defaultValue={
                                                settings.school_address ?? ''
                                            }
                                            rows={3}
                                            required
                                        />
                                    </FormField>
                                </div>
                            </SettingsSection>

                            <SettingsSection
                                icon={Image}
                                title="Profil dan program"
                                description="Konten profil yang ditampilkan pada halaman beranda."
                            >
                                <div className="space-y-5">
                                    <FormField
                                        htmlFor="school_description"
                                        label="Deskripsi singkat"
                                        error={errors.school_description}
                                        required
                                    >
                                        <Textarea
                                            id="school_description"
                                            name="school_description"
                                            defaultValue={
                                                settings.school_description ??
                                                ''
                                            }
                                            rows={4}
                                            required
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="school_history"
                                        label="Sejarah singkat"
                                        error={errors.school_history}
                                    >
                                        <Textarea
                                            id="school_history"
                                            name="school_history"
                                            defaultValue={
                                                settings.school_history ?? ''
                                            }
                                            rows={5}
                                        />
                                    </FormField>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormField
                                            htmlFor="school_vision"
                                            label="Visi"
                                            error={errors.school_vision}
                                        >
                                            <Textarea
                                                id="school_vision"
                                                name="school_vision"
                                                defaultValue={
                                                    settings.school_vision ?? ''
                                                }
                                                rows={5}
                                            />
                                        </FormField>
                                        <FormField
                                            htmlFor="school_mission"
                                            label="Misi"
                                            error={errors.school_mission}
                                            hint="Tuliskan satu butir misi per baris."
                                        >
                                            <Textarea
                                                id="school_mission"
                                                name="school_mission"
                                                defaultValue={
                                                    settings.school_mission ??
                                                    ''
                                                }
                                                rows={5}
                                            />
                                        </FormField>
                                        <FormField
                                            htmlFor="school_facilities"
                                            label="Fasilitas"
                                            error={errors.school_facilities}
                                            hint="Tuliskan satu fasilitas per baris."
                                        >
                                            <Textarea
                                                id="school_facilities"
                                                name="school_facilities"
                                                defaultValue={
                                                    settings.school_facilities ??
                                                    ''
                                                }
                                                rows={5}
                                            />
                                        </FormField>
                                        <FormField
                                            htmlFor="school_extracurriculars"
                                            label="Ekstrakurikuler"
                                            error={
                                                errors.school_extracurriculars
                                            }
                                            hint="Tuliskan satu kegiatan per baris."
                                        >
                                            <Textarea
                                                id="school_extracurriculars"
                                                name="school_extracurriculars"
                                                defaultValue={
                                                    settings.school_extracurriculars ??
                                                    ''
                                                }
                                                rows={5}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            </SettingsSection>

                            <SettingsSection
                                icon={Globe2}
                                title="Tautan publik"
                                description="Media sosial dan peta lokasi resmi sekolah."
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        htmlFor="facebook_url"
                                        label="Facebook"
                                        error={errors.facebook_url}
                                    >
                                        <Input
                                            id="facebook_url"
                                            name="facebook_url"
                                            type="url"
                                            defaultValue={
                                                settings.facebook_url ?? ''
                                            }
                                            placeholder="https://facebook.com/..."
                                        />
                                    </FormField>
                                    <FormField
                                        htmlFor="instagram_url"
                                        label="Instagram"
                                        error={errors.instagram_url}
                                    >
                                        <Input
                                            id="instagram_url"
                                            name="instagram_url"
                                            type="url"
                                            defaultValue={
                                                settings.instagram_url ?? ''
                                            }
                                            placeholder="https://instagram.com/..."
                                        />
                                    </FormField>
                                </div>
                                <div className="mt-5">
                                    <FormField
                                        htmlFor="map_embed_url"
                                        label="URL sematan peta"
                                        error={errors.map_embed_url}
                                        hint="Gunakan URL HTTPS dari fitur sematkan Google Maps."
                                    >
                                        <Input
                                            id="map_embed_url"
                                            name="map_embed_url"
                                            type="url"
                                            defaultValue={
                                                settings.map_embed_url ?? ''
                                            }
                                            placeholder="https://www.google.com/maps/embed?..."
                                        />
                                    </FormField>
                                </div>
                            </SettingsSection>

                            {progress && (
                                <p className="text-sm font-semibold text-brand-700">
                                    Mengunggah logo {progress.percentage}%
                                </p>
                            )}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={processing}
                                >
                                    <Save className="size-4" />
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan pengaturan'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </PageTransition>
        </AdminLayout>
    );
}

type SettingsSectionProps = PropsWithChildren<{
    description: string;
    icon: typeof Building2;
    title: string;
}>;

function SettingsSection({
    children,
    description,
    icon: Icon,
    title,
}: SettingsSectionProps) {
    return (
        <Card className="p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3 border-b border-slate-200 pb-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="size-5" />
                </span>
                <div>
                    <h2 className="font-heading text-lg font-bold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </Card>
    );
}
