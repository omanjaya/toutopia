import { Metadata } from "next";
import { WhatsappSettingsContent } from "./whatsapp-settings-content";

export const metadata: Metadata = {
    title: "Notifikasi WhatsApp | Toutopia",
    description: "Atur notifikasi WhatsApp untuk pengingat belajar",
};

export default function WhatsappSettingsPage() {
    return <WhatsappSettingsContent />;
}
