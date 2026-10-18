import { SettingsImageUpload } from '@/components/settings-image-upload';

export function StoryImageUpload(props: {
    id: string;
    name: string;
    removeName: string;
    label: string;
    currentUrl: string | null;
    error?: string;
    onChange?: () => void;
    onValidationError?: (error: string | null) => void;
}) {
    return <SettingsImageUpload {...props} key={props.currentUrl} compact />;
}
