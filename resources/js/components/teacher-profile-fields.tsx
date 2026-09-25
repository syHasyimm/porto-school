import { FormField } from '@/components/form-field';
import { PhotoUpload } from '@/components/photo-upload';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Teacher } from '@/types';

type TeacherProfileFieldsProps = {
    errors: Partial<Record<string, string>>;
    teacher?: Partial<Teacher>;
};

export function TeacherProfileFields({
    errors,
    teacher,
}: TeacherProfileFieldsProps) {
    return (
        <div className="space-y-6">
            <PhotoUpload currentUrl={teacher?.photo_url} />
            {errors.photo && (
                <p className="text-sm font-medium text-red-600">
                    {errors.photo}
                </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    htmlFor="nip"
                    label="NIP"
                    error={errors.nip}
                    hint="Boleh dikosongkan bila belum tersedia."
                >
                    <Input
                        id="nip"
                        name="nip"
                        defaultValue={teacher?.nip ?? ''}
                        inputMode="numeric"
                    />
                </FormField>
                <FormField
                    htmlFor="subject"
                    label="Mata pelajaran atau kelas"
                    error={errors.subject}
                    required
                >
                    <Input
                        id="subject"
                        name="subject"
                        defaultValue={teacher?.subject ?? ''}
                        required
                        placeholder="Contoh: Guru Kelas IV"
                    />
                </FormField>
                <FormField
                    htmlFor="phone"
                    label="Nomor telepon"
                    error={errors.phone}
                >
                    <Input
                        id="phone"
                        name="phone"
                        defaultValue={teacher?.phone ?? ''}
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                    />
                </FormField>
                <FormField
                    htmlFor="birth_date"
                    label="Tanggal lahir"
                    error={errors.birth_date}
                >
                    <Input
                        id="birth_date"
                        name="birth_date"
                        defaultValue={teacher?.birth_date ?? ''}
                        type="date"
                    />
                </FormField>
            </div>
            <FormField htmlFor="address" label="Alamat" error={errors.address}>
                <Textarea
                    id="address"
                    name="address"
                    defaultValue={teacher?.address ?? ''}
                    rows={3}
                />
            </FormField>
            <FormField
                htmlFor="bio"
                label="Bio singkat"
                error={errors.bio}
                hint="Ditampilkan pada halaman guru publik."
            >
                <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={teacher?.bio ?? ''}
                    rows={4}
                />
            </FormField>
        </div>
    );
}
